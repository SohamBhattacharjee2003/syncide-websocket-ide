import { useState, useRef, useCallback, useEffect } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
};

/**
 * useWebRTC — Perfect Negotiation with Transceiver Pre-Warming
 * 
 * 1. Proactively adds "sendrecv" transceivers for audio/video even before hardware is allowed.
 * 2. Uses replaceTrack() to seamlessly pipe live camera bytes into the pre-warmed tunnel.
 * 3. Never adds or removes tracks dynamically, entirely avoiding negotiation collision bugs across browsers.
 */
export default function useWebRTC({ socket, roomId, userName, localStream }) {
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peerStatuses, setPeerStatuses]  = useState(new Map());

  const peersRef      = useRef(new Map()); // peerId -> RTCPeerConnection
  const politeRef     = useRef(new Map()); // peerId -> boolean
  const makingOffer   = useRef(new Map()); // peerId -> boolean
  const socketRef     = useRef(socket);
  const roomIdRef     = useRef(roomId);
  const userNameRef   = useRef(userName);
  const localStreamRef = useRef(localStream);

  useEffect(() => { socketRef.current = socket; }, [socket]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { userNameRef.current = userName; }, [userName]);
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

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

    // ── Pre-Warm Transceivers (Forces early negotiation of both media types) ──
    pc.addTransceiver("audio", { direction: "sendrecv" });
    pc.addTransceiver("video", { direction: "sendrecv" });

    // ── negotiation needed (Perfect Negotiation) ──
    pc.onnegotiationneeded = async () => {
      try {
        makingOffer.current.set(peerId, true);
        await pc.setLocalDescription(); // automatically triggers createOffer implicitly
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
      console.log(`[WebRTC] ICE state for ${peerId}: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === "failed") pc.restartIce?.();
    };

    // ── remote tracks ──
    pc.ontrack = ({ track, streams }) => {
      console.log(`[WebRTC] ontrack(${track.kind}) from ${peerId} stream count = ${streams.length}`);
      
      setRemoteStreams(prev => {
        const m = new Map(prev);
        const existingInfo = m.get(peerId);
        let nextStream;
        
        // Native Transceivers do NOT perfectly join the same MediaStream by default unless explicitly attached.
        if (existingInfo && existingInfo.stream) {
          const currentTracks = existingInfo.stream.getTracks();
          if (!currentTracks.includes(track)) {
            // CRITICAL BUG FIX: Do NOT mutate nextStream.addTrack(track)
            // Creating a new MediaStream changes the stream ID, forcing React's <video> key to remount!
            nextStream = new MediaStream([...currentTracks, track]);
          } else {
            nextStream = existingInfo.stream;
          }
        } else {
          // No stream yet, so initialize it with this track
          // ALWAYS create a fresh MediaStream to ensure stable IDs
          const initialTracks = streams[0] ? streams[0].getTracks() : [];
          if (!initialTracks.includes(track)) initialTracks.push(track);
          nextStream = new MediaStream(initialTracks);
        }

        
        m.set(peerId, { 
          ...existingInfo, // Preserve existing metadata like userName
          stream: nextStream, 
          lastUpdate: Date.now() 
        });
        return m;
      });

      // Purely auxiliary
      track.onmute = () => {};
      track.onunmute = () => {};
    };

    // ── connection state ──
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${peerId} Connection State → ${pc.connectionState}`);
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        removePeer(peerId);
      }
    };

    peersRef.current.set(peerId, pc);
    return pc;
  }, [removePeer]);

  // ── join / leave ──────────────────────────────────────────────────────────

  const joinCall = useCallback(() => {
    if (!socketRef.current || !roomIdRef.current) {
      console.log("[WebRTC] Cannot join: missing socket or roomId");
      return;
    }
    
    console.log(`[WebRTC] Joining video call with userName=${userNameRef.current}`);
    socketRef.current.emit("join-video-call", {
      roomId:   roomIdRef.current,
      userName: userNameRef.current,
    });
  }, []);

  // Auto-join removed - let component control when to join

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

    const handleUserJoined = ({ peerId, userName }) => {
      console.log(`[WebRTC] User joined: ${peerId} (${userName})`);
      createPeerConnection(peerId, false); // existing peer -> impolite
      
      // Store the userName with the peer's data
      setRemoteStreams(prev => {
        const m = new Map(prev);
        const existingInfo = m.get(peerId) || {};
        m.set(peerId, { ...existingInfo, userName, lastUpdate: Date.now() });
        return m;
      });

      // Broadcast current media status to the new joiner
      const currentStream = localStreamRef.current;
      const currentMic = currentStream?.getAudioTracks().some(t => t.enabled && t.readyState === 'live') ?? false;
      const currentCam = currentStream?.getVideoTracks().some(t => t.enabled && t.readyState === 'live') ?? false;
      socket.emit("media-status-changed", { roomId, isMicOn: currentMic, isCameraOn: currentCam });
    };

    const handleExistingPeers = (peers) => {
      console.log(`[WebRTC] Received existing peers:`, peers);
      peers.forEach(({ peerId, userName }) => {
        console.log(`[WebRTC] Creating connection for existing peer: ${peerId} (${userName})`);
        createPeerConnection(peerId, true); // joiner -> polite
        
        // Store the userName with the peer's data (polite side)
        setRemoteStreams(prev => {
          const m = new Map(prev);
          const existingInfo = m.get(peerId) || {};
          const updatedInfo = { ...existingInfo, userName, lastUpdate: Date.now() };
          m.set(peerId, updatedInfo);
          console.log(`[WebRTC] Stored peer info for ${peerId}:`, updatedInfo);
          return m;
        });
      });
    };

    const handleRequestMediaStatus = ({ from }) => {
      console.log(`[WebRTC] Media status requested by ${from}`);
      const currentStream = localStreamRef.current;
      const currentMic = currentStream?.getAudioTracks().some(t => t.enabled && t.readyState === 'live') ?? false;
      const currentCam = currentStream?.getVideoTracks().some(t => t.enabled && t.readyState === 'live') ?? false;
      socket.emit("media-status-changed", { roomId, isMicOn: currentMic, isCameraOn: currentCam });
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

    const handleLeft = ({ peerId, userName }) => {
      console.log(`[WebRTC] User left: ${peerId} (${userName})`);
      removePeer(peerId);
    };

    const handleStatusUpdate = ({ peerId, isMicOn, isCameraOn }) => {
      console.log(`[WebRTC] Status update for ${peerId}: mic=${isMicOn}, camera=${isCameraOn}`);
      setPeerStatuses(prev => {
        const updated = new Map(prev);
        updated.set(peerId, { isMicOn, isCameraOn });
        return updated;
      });
    };

    socket.on("user-joined-video",    handleUserJoined);
    socket.on("existing-video-peers", handleExistingPeers);
    socket.on("request-media-status", handleRequestMediaStatus);
    socket.on("video-offer",          handleOffer);
    socket.on("video-answer",         handleAnswer);
    socket.on("ice-candidate",        handleIce);
    socket.on("user-left-video",      handleLeft);
    socket.on("media-status-update",  handleStatusUpdate);

    return () => {
      socket.off("user-joined-video",    handleUserJoined);
      socket.off("existing-video-peers", handleExistingPeers);
      socket.off("request-media-status", handleRequestMediaStatus);
      socket.off("video-offer",          handleOffer);
      socket.off("video-answer",         handleAnswer);
      socket.off("ice-candidate",        handleIce);
      socket.off("user-left-video",      handleLeft);
      socket.off("media-status-update",  handleStatusUpdate);
    };
  }, [socket, roomId, createPeerConnection, removePeer]);

  // ── HOT-SWAP TRACKS ───────────────────────────────────────────────────────
  // Replaces the track on our pre-warmed transceivers instantly
  
  useEffect(() => {
    const syncTracks = async () => {
      const realAudio = localStream?.getAudioTracks()[0] || null;
      const realVideo = localStream?.getVideoTracks()[0] || null;

      for (const [peerId, pc] of peersRef.current.entries()) {
        if (pc.signalingState === "closed") continue;

        let changed = false;
        pc.getTransceivers().forEach(tc => {
          if (tc.receiver.track.kind === "audio") {
            if (tc.sender.track !== realAudio) {
              tc.sender.replaceTrack(realAudio).catch(e => console.error(e));
              changed = true;
            }
          }
          if (tc.receiver.track.kind === "video") {
            if (tc.sender.track !== realVideo) {
              tc.sender.replaceTrack(realVideo).catch(e => console.error(e));
              changed = true;
            }
          }
        });

        // CRITICAL FIX: Chrome and Safari often freeze the byte pipeline when 
        // replaceTrack swaps a null track for a live track because the SSRC changes.
        // We MUST manually force an SDP renegotiation to update the packet decoders!
        if (changed && pc.signalingState === "stable") {
          try {
            makingOffer.current.set(peerId, true);
            await pc.setLocalDescription(); 
            socketRef.current?.emit("video-offer", {
              roomId: roomIdRef.current,
              offer:  pc.localDescription,
              to:     peerId,
            });
          } catch (e) {
            console.error("[WebRTC] explicit renegotiation error:", e);
          } finally {
            makingOffer.current.set(peerId, false);
          }
        }
      }
    };
    syncTracks();
  }, [localStream]);

  // Broadcast status whenever localStream changes
  useEffect(() => {
    if (!socket || !roomId) return;
    const isMicOn = localStream?.getAudioTracks().some(t => t.enabled && t.readyState === 'live') ?? false;
    const isCameraOn = localStream?.getVideoTracks().some(t => t.enabled && t.readyState === 'live') ?? false;
    socket.emit("media-status-changed", { roomId, isMicOn, isCameraOn });
    
    // Also update our OWN status immediately in the UI (prevents delays)
    setPeerStatuses(prev => new Map(prev).set("local", { isMicOn, isCameraOn }));
  }, [socket, roomId, localStream]);

  // ── expose map ────────────────────────────────────────────────────────────

  const remoteParticipants = new Map();
  
  // Combine streams and statuses
  remoteStreams.forEach((streamData, peerId) => {
    if (peerId === "local") return;
    
    const status = peerStatuses.get(peerId) || { isMicOn: false, isCameraOn: false };
    
    remoteParticipants.set(peerId, {
      stream:     streamData?.stream || null,
      userName:   streamData?.userName || "Participant",
      isMicOn:    status.isMicOn,
      isCameraOn: status.isCameraOn,
    });
  });
  
  // Also include peers that have status but no stream yet
  peerStatuses.forEach((status, peerId) => {
    if (peerId === "local" || remoteParticipants.has(peerId)) return;
    
    const streamData = remoteStreams.get(peerId);
    remoteParticipants.set(peerId, {
      stream:     null,
      userName:   streamData?.userName || "Participant",
      isMicOn:    status.isMicOn,
      isCameraOn: status.isCameraOn,
    });
  });

  return { remoteStreams: remoteParticipants, peerStatuses, joinCall, leaveCall, cleanup: leaveCall };
}
