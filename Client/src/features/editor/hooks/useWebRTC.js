import { useState, useRef, useEffect, useCallback } from "react";

export default function useWebRTC({ roomId, socket, userName }) {
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const peerConnections = useRef({});
  const localVideoRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  // Initialize media stream
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      setLocalStream(stream);
      setIsCameraOn(true);
      setIsMicOn(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      throw error;
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      setIsCameraOn(false);
      setIsMicOn(false);
    }
  }, [localStream]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor",
        },
        audio: true,
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Notify other peers about screen share
      socket?.emit("screen-share-started", { roomId, userName });

      return stream;
    } catch (error) {
      console.error("Error sharing screen:", error);
      setIsScreenSharing(false);
      throw error;
    }
  }, [roomId, socket, userName]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      socket?.emit("screen-share-stopped", { roomId, userName });
    }
  }, [screenStream, roomId, socket, userName]);

  // Create peer connection
  const createPeerConnection = useCallback(
    (peerId) => {
      const pc = new RTCPeerConnection(iceServers);

      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Add screen share tracks if sharing
      if (screenStream) {
        screenStream.getTracks().forEach((track) => {
          pc.addTrack(track, screenStream);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
            to: peerId,
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        setConnectionStatus(pc.connectionState);
      };

      // Handle incoming tracks
      pc.ontrack = (event) => {
        setRemoteStreams((prev) => ({
          ...prev,
          [peerId]: event.streams[0],
        }));
      };

      peerConnections.current[peerId] = pc;
      return pc;
    },
    [localStream, screenStream, roomId, socket]
  );

  // Handle offer
  const handleOffer = useCallback(
    async (offer, fromPeerId) => {
      const pc = createPeerConnection(fromPeerId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.emit("video-answer", {
        roomId,
        answer,
        to: fromPeerId,
      });
    },
    [createPeerConnection, roomId, socket]
  );

  // Handle answer
  const handleAnswer = useCallback(async (answer, fromPeerId) => {
    const pc = peerConnections.current[fromPeerId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate, fromPeerId) => {
    const pc = peerConnections.current[fromPeerId];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  // Call a peer
  const callPeer = useCallback(
    async (peerId) => {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.emit("video-offer", {
        roomId,
        offer,
        to: peerId,
      });
    },
    [createPeerConnection, roomId, socket]
  );

  // Cleanup
  const cleanup = useCallback(() => {
    stopCamera();
    stopScreenShare();

    Object.values(peerConnections.current).forEach((pc) => {
      pc.close();
    });
    peerConnections.current = {};
    setRemoteStreams({});
  }, [stopCamera, stopScreenShare]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("video-offer", ({ offer, from }) => {
      handleOffer(offer, from);
    });

    socket.on("video-answer", ({ answer, from }) => {
      handleAnswer(answer, from);
    });

    socket.on("ice-candidate", ({ candidate, from }) => {
      handleIceCandidate(candidate, from);
    });

    socket.on("user-joined-video", ({ peerId }) => {
      if (localStream) {
        callPeer(peerId);
      }
    });

    socket.on("user-left-video", ({ peerId }) => {
      if (peerConnections.current[peerId]) {
        peerConnections.current[peerId].close();
        delete peerConnections.current[peerId];
      }
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[peerId];
        return newStreams;
      });
    });

    return () => {
      socket.off("video-offer");
      socket.off("video-answer");
      socket.off("ice-candidate");
      socket.off("user-joined-video");
      socket.off("user-left-video");
    };
  }, [socket, handleOffer, handleAnswer, handleIceCandidate, callPeer, localStream]);

  return {
    localStream,
    screenStream,
    remoteStreams,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    connectionStatus,
    localVideoRef,
    startCamera,
    stopCamera,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    callPeer,
    cleanup,
  };
}
