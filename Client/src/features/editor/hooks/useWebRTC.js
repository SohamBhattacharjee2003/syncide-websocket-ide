import { useState, useRef, useCallback, useEffect } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * useWebRTC — peer connections for audio/video.
 *
 * Expects localStream to already have an audio track when joinCall runs
 * (useMediaStream auto-acquires mic). This avoids SDP m-line issues.
 */
export default function useWebRTC(socket, roomId, userName, localStream, screenStream) {
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const peersRef = useRef(new Map());
  const inCallRef = useRef(false);
  const localStreamRef = useRef(localStream);
  const screenStreamRef = useRef(screenStream);

  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);
  useEffect(() => { screenStreamRef.current = screenStream; }, [screenStream]);

  // ---------- create peer ----------
  const createPeerConnection = useCallback((peerId) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId);

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks (localStream should already exist with audio)
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log(`[WebRTC] addTrack ${track.kind} for ${peerId}`);
      });
    } else {
      console.warn("[WebRTC] no localStream when creating peer — audio may not work!");
    }

    // Screen share
    const screen = screenStreamRef.current;
    if (screen) {
      screen.getTracks().forEach((t) => pc.addTrack(t, screen));
    }

    // ICE
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: e.candidate, to: peerId });
      }
    };

    // Receive remote tracks
    pc.ontrack = (event) => {
      console.log(`[WebRTC] ontrack ${event.track.kind} from ${peerId}`);
      const remoteStream = event.streams?.[0] || new MediaStream();
      if (!remoteStream.getTrackById(event.track.id)) {
        remoteStream.addTrack(event.track);
      }
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(peerId, { stream: remoteStream, userName: peerId });
        return next;
      });
    };

    // No onnegotiationneeded — we only negotiate explicitly

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${peerId} → ${pc.connectionState}`);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        removePeer(peerId);
      }
    };

    peersRef.current.set(peerId, pc);
    return pc;
  }, [socket, roomId]);

  // ---------- remove peer ----------
  const removePeer = useCallback((peerId) => {
    const pc = peersRef.current.get(peerId);
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
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

  // ---------- join / leave ----------
  const joinCall = useCallback(() => {
    if (!socket || !roomId) return;
    inCallRef.current = true;
    socket.emit("join-video-call", { roomId, userName });
    console.log("[WebRTC] joinCall →", roomId);
  }, [socket, roomId, userName]);

  const leaveCall = useCallback(() => {
    inCallRef.current = false;
    if (socket && roomId) socket.emit("leave-video-call", { roomId, userName });
    peersRef.current.forEach((pc) => { pc.close(); });
    peersRef.current.clear();
    setRemoteStreams(new Map());
  }, [socket, roomId, userName]);

  // ---------- signaling ----------
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = async ({ peerId }) => {
      if (!inCallRef.current) return;
      console.log(`[WebRTC] peer joined → ${peerId}, creating offer`);
      const pc = createPeerConnection(peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("video-offer", { roomId, offer, to: peerId });
      } catch (e) { console.error("[WebRTC] offer error:", e); }
    };

    const handleOffer = async ({ offer, from }) => {
      console.log(`[WebRTC] got offer from ${from}`);
      if (!inCallRef.current) inCallRef.current = true;
      let pc = peersRef.current.get(from);
      if (!pc) pc = createPeerConnection(from);
      try {
        if (pc.signalingState !== "stable") {
          // Glare: both sides sent offers; one side must rollback
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
      } catch (e) { console.error("[WebRTC] handle-offer error:", e); }
    };

    const handleAnswer = async ({ answer, from }) => {
      const pc = peersRef.current.get(from);
      if (pc?.signalingState === "have-local-offer") {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log(`[WebRTC] answer set for ${from}`);
        } catch (e) { console.error("[WebRTC] answer error:", e); }
      }
    };

    const handleIce = async ({ candidate, from }) => {
      const pc = peersRef.current.get(from);
      if (pc) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
        catch (e) { /* ignore late candidates */ }
      }
    };

    const handleLeft = ({ peerId }) => removePeer(peerId);

    socket.on("user-joined-video", handleUserJoined);
    socket.on("video-offer", handleOffer);
    socket.on("video-answer", handleAnswer);
    socket.on("ice-candidate", handleIce);
    socket.on("user-left-video", handleLeft);

    return () => {
      socket.off("user-joined-video", handleUserJoined);
      socket.off("video-offer", handleOffer);
      socket.off("video-answer", handleAnswer);
      socket.off("ice-candidate", handleIce);
      socket.off("user-left-video", handleLeft);
    };
  }, [socket, roomId, createPeerConnection, removePeer]);

  // ---------- track sync ----------
  // When localStream changes (e.g. camera toggled → new getUserMedia stream),
  // replace tracks on existing senders.
  useEffect(() => {
    if (!localStream) return;
    peersRef.current.forEach((pc, peerId) => {
      const senders = pc.getSenders();
      localStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          console.log(`[WebRTC] replaceTrack ${track.kind} for ${peerId}`);
          sender.replaceTrack(track);
        }
        // If no sender for this kind, we'd need addTrack + renegotiation.
        // But since we auto-acquire mic, audio sender always exists.
      });
    });
  }, [localStream]);

  // Screen share: replace video track
  useEffect(() => {
    peersRef.current.forEach((pc) => {
      const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (screenStream && videoSender) {
        const st = screenStream.getVideoTracks()[0];
        if (st) videoSender.replaceTrack(st);
      } else if (!screenStream && videoSender) {
        const cam = localStreamRef.current?.getVideoTracks()[0] || null;
        videoSender.replaceTrack(cam);
      }
    });
    if (screenStream && socket && roomId) {
      socket.emit("screen-share-started", { roomId, userName });
    } else if (!screenStream && socket && roomId && inCallRef.current) {
      socket.emit("screen-share-stopped", { roomId, userName });
    }
  }, [screenStream, socket, roomId, userName]);

  return { remoteStreams, joinCall, leaveCall };
}
