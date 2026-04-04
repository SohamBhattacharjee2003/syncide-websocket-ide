import { useState, useRef, useCallback, useEffect } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
};

// ─── DUMMY STREAM GENERATOR ─────────────────────────────────────────────
// Creates a silent audio track and black video track so that WebRTC can
// establish a permanent flow of bytes. We use `replaceTrack` to swap in
// real tracks later, completely avoiding fragile renegotiation bugs!
const createDummyStream = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 640, 480);
  const videoStream = canvas.captureStream(1);

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  return new MediaStream([
    ...videoStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);
};

let sharedDummyStream = null;
const getDummyStream = () => {
  if (!sharedDummyStream) sharedDummyStream = createDummyStream();
  return sharedDummyStream;
};

/**
 * useWebRTC — The "Holy Grail" Negotiation Pattern.
 * 
 * 1. Automatically seeds every connection with a Dummy Stream (silence+black).
 * 2. Perfect Negotiation establishes the WebRTC tunnel once and forever.
 * 3. Toggling camera/mic ONLY hot-swaps tracks via replaceTrack() using the
 *    stable tunnel. Zero renegotiation = zero timing bugs!
 */
export default function useWebRTC(socket, roomId, userName, localStream) {
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peerStatuses, setPeerStatuses]  = useState(new Map());

  const peersRef      = useRef(new Map()); // peerId -> RTCPeerConnection
  const politeRef     = useRef(new Map()); // peerId -> boolean
  const makingOffer   = useRef(new Map()); // peerId -> boolean
  const socketRef     = useRef(socket);
  const roomIdRef     = useRef(roomId);
  const userNameRef   = useRef(userName);

  useEffect(() => { socketRef.current = socket; }, [socket]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { userNameRef.current = userName; }, [userName]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const removePeer = useCallback((peerId) => {
    const pc = peersRef.current.get(peerId);
    if (pc) { pc.close(); peersRef.current.delete(peerId); }
    politeRef.current.delete(peerId);
    makingOffer.current.delete(peerId);
    setRemoteStreams(prev => { const m = new Map(prev); m.delete(peerId); return m; });
    setPeerStatuses(prev => { const m = new Map(prev); m.delete(peerId); return m; });
  }, []);

  const flushIceQueue = async (pc) => {
    while (pc._iceQueue && pc._iceQueue.length > 0) {
      const c = pc._iceQueue.shift();
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.warn("[ICE] flush failed:", e); }
    }
  };

  // ── create peer connection ────────────────────────────────────────────────

  const createPeerConnection = useCallback((peerId, isPolite) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId);

    console.log(`[WebRTC] Creating PC for ${peerId} polite=${isPolite}`);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc._iceQueue = [];
    politeRef.current.set(peerId, isPolite);
    makingOffer.current.set(peerId, false);

    // ── Seed Connection with Dummy Tracks (Forces early negotiation) ──
    const dummy = getDummyStream();
    dummy.getTracks().forEach(t => pc.addTrack(t, dummy));

    // ── negotiation needed (Perfect Negotiation) ──
    pc.onnegotiationneeded = async () => {
      try {
        makingOffer.current.set(peerId, true);
        await pc.setLocalDescription();
        socketRef.current?.emit("video-offer", {
          roomId: roomIdRef.current,
          offer:  pc.localDescription,
          to:     peerId,
        });
      } catch (e) {
        console.error("[WebRTC] onnegotiationneeded error:", e);
      } finally {
        makingOffer.current.set(peerId, false);
      }
    };

    // ── ICE ──
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketRef.current?.emit("ice-candidate", {
          roomId: roomIdRef.current,
          candidate,
          to: peerId,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") pc.restartIce?.();
    };

    // ── remote tracks ──
    pc.ontrack = ({ track, streams }) => {
      console.log(`[WebRTC] ontrack(${track.kind}) from ${peerId}`);
      // remote audio/video will arrive inside `streams[0]` because they share the dummy stream ID
      if (streams && streams[0]) {
        setRemoteStreams(prev => {
          const m = new Map(prev);
          m.set(peerId, { stream: streams[0], lastUpdate: Date.now() });
          return m;
        });
      }

      // Fallback muting listeners (purely auxiliary)
      track.onmute = () => { /* purely browser-driven, handled by media-status-changed primarily */ };
      track.onunmute = () => {};
    };

    // ── connection state ──
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${peerId} → ${pc.connectionState}`);
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        removePeer(peerId);
      }
    };

    peersRef.current.set(peerId, pc);
    return pc;
  }, [removePeer]);

  // ── join / leave ──────────────────────────────────────────────────────────

  const joinCall = useCallback(() => {
    if (!socketRef.current || !roomIdRef.current) return;
    socketRef.current.emit("join-video-call", {
      roomId:   roomIdRef.current,
      userName: userNameRef.current,
    });
  }, []);

  useEffect(() => {
    if (socket && roomId && userName) joinCall();
  }, [socket, roomId, userName, joinCall]);

  const leaveCall = useCallback(() => {
    socketRef.current?.emit("leave-video-call", {
      roomId:   roomIdRef.current,
      userName: userNameRef.current,
    });
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    politeRef.current.clear();
    makingOffer.current.clear();
    setRemoteStreams(new Map());
    setPeerStatuses(new Map());
  }, []);

  // ── socket events ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = ({ peerId }) => {
      createPeerConnection(peerId, false); // existing peer -> impolite
    };

    const handleExistingPeers = (peers) => {
      peers.forEach(({ peerId }) => createPeerConnection(peerId, true)); // joiner -> polite
    };

    const handleOffer = async ({ offer, from }) => {
      let pc = peersRef.current.get(from);
      if (!pc) pc = createPeerConnection(from, true);

      const isPolite  = politeRef.current.get(from) ?? true;
      const isMaking  = makingOffer.current.get(from) ?? false;
      const collision = pc.signalingState !== "stable" || isMaking;

      // Ignore collision if impolite
      if (!isPolite && collision) return; 

      try {
        if (collision) await pc.setLocalDescription({ type: "rollback" });
        await pc.setRemoteDescription(offer);
        await flushIceQueue(pc);
        
        await pc.setLocalDescription();
        socket.emit("video-answer", {
          roomId: roomIdRef.current,
          answer: pc.localDescription,
          to:     from,
        });
      } catch (e) {
        console.error("[WebRTC] Error handling offer:", e);
      }
    };

    const handleAnswer = async ({ answer, from }) => {
      const pc = peersRef.current.get(from);
      if (!pc || pc.signalingState === "stable") return;
      try {
        await pc.setRemoteDescription(answer);
        await flushIceQueue(pc);
      } catch (e) { console.error("[WebRTC] Error handling answer:", e); }
    };

    const handleIce = async ({ candidate, from }) => {
      const pc = peersRef.current.get(from);
      if (!pc) return;
      if (pc.remoteDescription?.type) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
        catch (e) { console.warn("[ICE] error:", e.message); }
      } else {
        pc._iceQueue.push(candidate);
      }
    };

    const handleLeft = ({ peerId }) => removePeer(peerId);

    const handleStatusUpdate = ({ peerId, isMicOn, isCameraOn }) => {
      setPeerStatuses(prev => new Map(prev).set(peerId, { isMicOn, isCameraOn }));
    };

    socket.on("user-joined-video",    handleUserJoined);
    socket.on("existing-video-peers", handleExistingPeers);
    socket.on("video-offer",          handleOffer);
    socket.on("video-answer",         handleAnswer);
    socket.on("ice-candidate",        handleIce);
    socket.on("user-left-video",      handleLeft);
    socket.on("media-status-update",  handleStatusUpdate);

    return () => {
      socket.off("user-joined-video",    handleUserJoined);
      socket.off("existing-video-peers", handleExistingPeers);
      socket.off("video-offer",          handleOffer);
      socket.off("video-answer",         handleAnswer);
      socket.off("ice-candidate",        handleIce);
      socket.off("user-left-video",      handleLeft);
      socket.off("media-status-update",  handleStatusUpdate);
    };
  }, [socket, roomId, createPeerConnection, removePeer]);

  // ── HOT-SWAP TRACKS ───────────────────────────────────────────────────────
  // Because we seeded the PC with dummy tracks, every target sender already exists!
  
  useEffect(() => {
    const syncTracks = async () => {
      const dummy = getDummyStream();
      const realAudio = localStream?.getAudioTracks()[0] || dummy.getAudioTracks()[0];
      const realVideo = localStream?.getVideoTracks()[0] || dummy.getVideoTracks()[0];

      for (const [peerId, pc] of peersRef.current.entries()) {
        if (pc.signalingState === "closed") continue;

        pc.getSenders().forEach(sender => {
          if (sender.track?.kind === "audio" && sender.track !== realAudio) {
            sender.replaceTrack(realAudio).catch(e => console.warn(e));
          }
          if (sender.track?.kind === "video" && sender.track !== realVideo) {
            sender.replaceTrack(realVideo).catch(e => console.warn(e));
          }
        });
      }
    };
    syncTracks();
  }, [localStream]);

  // Broadcast status whenever localStream changes
  useEffect(() => {
    if (!socket || !roomId) return;
    const isMicOn = localStream?.getAudioTracks().length > 0 ?? false;
    const isCameraOn = localStream?.getVideoTracks().length > 0 ?? false;
    socket.emit("media-status-changed", { roomId, isMicOn, isCameraOn });
    
    // Also update our OWN status immediately in the UI (prevents delays)
    setPeerStatuses(prev => new Map(prev).set("local", { isMicOn, isCameraOn }));
  }, [socket, roomId, localStream]);

  // ── expose map ────────────────────────────────────────────────────────────

  const remoteParticipants = new Map();
  remoteStreams.forEach((streamData, peerId) => {
    const status = peerStatuses.get(peerId) || { isMicOn: false, isCameraOn: false };
    remoteParticipants.set(peerId, {
      stream:     streamData.stream,
      isMicOn:    status.isMicOn,
      isCameraOn: status.isCameraOn,
    });
  });

  return { remoteStreams: remoteParticipants, peerStatuses, joinCall, leaveCall, cleanup: leaveCall };
}
