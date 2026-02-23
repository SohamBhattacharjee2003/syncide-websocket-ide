import { useState, useRef, useCallback, useEffect } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * useWebRTC — manages peer-to-peer connections for audio/video/screen.
 *
 * Key fix: when localStream changes (mic/camera toggled after connection),
 * we add tracks AND trigger renegotiation (new offer/answer) so the remote
 * peer starts receiving audio/video.
 */
export default function useWebRTC(socket, roomId, userName, localStream, screenStream) {
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const peersRef = useRef(new Map());
  const inCallRef = useRef(false);
  const localStreamRef = useRef(localStream);
  const screenStreamRef = useRef(screenStream);

  // Keep refs in sync so closures always see latest stream
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);
  useEffect(() => { screenStreamRef.current = screenStream; }, [screenStream]);

  // ---------- Renegotiate with a peer ----------
  const renegotiate = useCallback(async (peerId) => {
    const pc = peersRef.current.get(peerId);
    if (!pc || !socket) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("video-offer", { roomId, offer, to: peerId });
    } catch (err) {
      console.error("[useWebRTC] renegotiate error:", err);
    }
  }, [socket, roomId]);

  // ---------- Create peer connection ----------
  const createPeerConnection = useCallback((peerId) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId);

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add current local tracks
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    // Add screen share track if active
    const screen = screenStreamRef.current;
    if (screen) {
      screen.getTracks().forEach((track) => {
        pc.addTrack(track, screen);
      });
    }

    // Send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate, to: peerId });
      }
    };

    // Receive remote tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.set(peerId, { stream: remoteStream, userName: peerId });
          return next;
        });
      }
    };

    // Handle negotiationneeded (fired when addTrack happens after connection)
    pc.onnegotiationneeded = async () => {
      // Only the offerer should renegotiate
      if (pc.signalingState === "stable") {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("video-offer", { roomId, offer, to: peerId });
        } catch (err) {
          console.error("[useWebRTC] onnegotiationneeded error:", err);
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        removePeer(peerId);
      }
    };

    peersRef.current.set(peerId, pc);
    return pc;
  }, [socket, roomId]);

  // ---------- Remove peer ----------
  const removePeer = useCallback((peerId) => {
    const pc = peersRef.current.get(peerId);
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onnegotiationneeded = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peersRef.current.delete(peerId);
    }
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  // ---------- Join / Leave ----------
  const joinCall = useCallback(() => {
    if (!socket || !roomId) return;
    inCallRef.current = true;
    socket.emit("join-video-call", { roomId, userName });
  }, [socket, roomId, userName]);

  const leaveCall = useCallback(() => {
    inCallRef.current = false;
    if (socket && roomId) {
      socket.emit("leave-video-call", { roomId, userName });
    }
    peersRef.current.forEach((pc) => {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onnegotiationneeded = null;
      pc.close();
    });
    peersRef.current.clear();
    setRemoteStreams(new Map());
  }, [socket, roomId, userName]);

  // ---------- Socket signaling handlers ----------
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = async ({ peerId }) => {
      if (!inCallRef.current) return;
      const pc = createPeerConnection(peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("video-offer", { roomId, offer, to: peerId });
      } catch (err) {
        console.error("[useWebRTC] createOffer error:", err);
      }
    };

    const handleOffer = async ({ offer, from }) => {
      if (!inCallRef.current) {
        inCallRef.current = true;
      }
      let pc = peersRef.current.get(from);
      if (!pc) {
        pc = createPeerConnection(from);
      }
      try {
        // Handle glare (both sides send offer simultaneously)
        if (pc.signalingState !== "stable") {
          await Promise.all([
            pc.setLocalDescription({ type: "rollback" }),
            pc.setRemoteDescription(new RTCSessionDescription(offer)),
          ]);
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
        }
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("video-answer", { roomId, answer, to: from });
      } catch (err) {
        console.error("[useWebRTC] handleOffer error:", err);
      }
    };

    const handleAnswer = async ({ answer, from }) => {
      const pc = peersRef.current.get(from);
      if (pc && pc.signalingState === "have-local-offer") {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("[useWebRTC] handleAnswer error:", err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate, from }) => {
      const pc = peersRef.current.get(from);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("[useWebRTC] addIceCandidate error:", err);
        }
      }
    };

    const handleUserLeft = ({ peerId }) => {
      removePeer(peerId);
    };

    socket.on("user-joined-video", handleUserJoined);
    socket.on("video-offer", handleOffer);
    socket.on("video-answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-left-video", handleUserLeft);

    return () => {
      socket.off("user-joined-video", handleUserJoined);
      socket.off("video-offer", handleOffer);
      socket.off("video-answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-left-video", handleUserLeft);
    };
  }, [socket, roomId, createPeerConnection, removePeer]);

  // ---------- Track management: when localStream changes ----------
  useEffect(() => {
    if (!localStream) return;
    peersRef.current.forEach((pc, peerId) => {
      const senders = pc.getSenders();
      localStream.getTracks().forEach((track) => {
        const existingSender = senders.find((s) => s.track?.kind === track.kind);
        if (existingSender) {
          existingSender.replaceTrack(track);
        } else {
          // Adding a new track triggers onnegotiationneeded automatically
          pc.addTrack(track, localStream);
        }
      });
    });
  }, [localStream]);

  // ---------- Track management: when screenStream changes ----------
  useEffect(() => {
    peersRef.current.forEach((pc) => {
      const senders = pc.getSenders();
      if (screenStream) {
        const screenTrack = screenStream.getVideoTracks()[0];
        if (screenTrack) {
          const videoSenders = senders.filter((s) => s.track?.kind === "video");
          if (videoSenders.length > 1) {
            videoSenders[1].replaceTrack(screenTrack);
          } else {
            pc.addTrack(screenTrack, screenStream);
          }
        }
      }
    });

    if (screenStream && socket && roomId) {
      socket.emit("screen-share-started", { roomId, userName });
    } else if (!screenStream && socket && roomId && inCallRef.current) {
      socket.emit("screen-share-stopped", { roomId, userName });
    }
  }, [screenStream, socket, roomId, userName]);

  return {
    remoteStreams,
    joinCall,
    leaveCall,
  };
}
