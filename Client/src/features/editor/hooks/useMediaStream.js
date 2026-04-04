import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useMediaStream — manages local mic, camera, and screen sharing.
 *
 * KEY DESIGN (mirrors Google Meet):
 *   - One persistent MediaStream object is created on mount.
 *   - Audio/Video tracks are added when user enables them.
 *   - Tracks are enabled/disabled via track.enabled toggle.
 *   - Screen tracks: separate stream, added/removed from WebRTC via a separate ref.
 */
export default function useMediaStream() {
  const persistentStreamRef = useRef(null); // The one stream handed to WebRTC
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef(null);

  // ── Initialize on mount: create empty stream ──
  useEffect(() => {
    const stream = new MediaStream();
    persistentStreamRef.current = stream;
    setLocalStream(stream);
    console.log("[useMediaStream] empty persistent stream created");

    // Cleanup on unmount or page unload
    const cleanup = () => {
      console.log("[useMediaStream] Cleaning up all tracks");
      persistentStreamRef.current?.getTracks().forEach((t) => {
        t.stop();
        console.log(`[useMediaStream] Stopped track: ${t.kind}`);
      });
      screenStream?.getTracks().forEach((t) => t.stop());
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);

  // ── Toggle microphone ──
  const toggleMic = useCallback(async () => {
    console.log("[useMediaStream.toggleMic] Called");
    const stream = persistentStreamRef.current;
    if (!stream) {
      console.error("[useMediaStream] No stream available");
      return;
    }

    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length === 0) {
      // First time - acquire audio
      try {
        console.log("[useMediaStream] Requesting audio permission...");
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true } 
        });
        
        if (audioStream.getAudioTracks().length === 0) {
          console.error("[useMediaStream] No audio tracks obtained");
          return;
        }

        audioStream.getAudioTracks().forEach((t) => {
          t.enabled = true;
          stream.addTrack(t);
        });
        
        setIsMicOn(true);
        setLocalStream(new MediaStream(stream.getTracks()));
        console.log("[useMediaStream] audio track added, isMicOn set to true");
      } catch (err) {
        console.error("[useMediaStream] Cannot access mic:", err);
        setIsMicOn(false);
      }
    } else {
      // Toggle existing audio
      const newState = !audioTracks[0].enabled;
      audioTracks.forEach((t) => (t.enabled = newState));
      setIsMicOn(newState);
      console.log(`[useMediaStream] mic toggled to ${newState}`);
    }
  }, []);

  // ── Toggle camera ──
  const toggleCamera = useCallback(async () => {
    console.log("[useMediaStream.toggleCamera] Called");
    const stream = persistentStreamRef.current;
    if (!stream) {
      console.error("[useMediaStream] No stream available");
      return;
    }

    const videoTracks = stream.getVideoTracks();

    if (videoTracks.length > 0) {
      // Camera track exists — toggle enabled state
      const newState = !videoTracks[0].enabled;
      videoTracks.forEach((t) => (t.enabled = newState));
      setIsCameraOn(newState);
      setLocalStream(new MediaStream(stream.getTracks()));
      console.log(`[useMediaStream] camera toggled to ${newState}`);
    } else {
      // First time — acquire camera
      try {
        console.log("[useMediaStream] Requesting camera permission...");
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });

        if (videoStream.getVideoTracks().length === 0) {
          console.error("[useMediaStream] No video tracks obtained");
          return;
        }

        videoStream.getVideoTracks().forEach((t) => {
          t.enabled = true;
          stream.addTrack(t);
        });

        setIsCameraOn(true);
        
        // Update local video preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setLocalStream(new MediaStream(stream.getTracks()));
        console.log("[useMediaStream] camera track added, isCameraOn set to true");
      } catch (err) {
        console.error("[useMediaStream] Cannot access camera:", err);
        setIsCameraOn(false);
      }
    }
  }, []);

  // ── Toggle screen sharing ──
  const toggleScreenShare = useCallback(async () => {
    console.log("[useMediaStream.toggleScreenShare] Called, isScreenSharing:", isScreenSharing);
    if (isScreenSharing && screenStream) {
      console.log("[useMediaStream] Stopping screen share");
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      return null;
    }
    try {
      console.log("[useMediaStream] Starting screen share");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("[useMediaStream] Screen share ended");
        setScreenStream(null);
        setIsScreenSharing(false);
      });
      setScreenStream(stream);
      setIsScreenSharing(true);
      console.log("[useMediaStream] Screen share started");
      return stream;
    } catch (err) {
      console.error("[useMediaStream] Screen share failed:", err);
      return null;
    }
  }, [isScreenSharing, screenStream]);

  // ── Stop all ──
  const stopAll = useCallback(() => {
    persistentStreamRef.current?.getTracks().forEach((t) => t.stop());
    persistentStreamRef.current = null;
    setLocalStream(null);
    screenStream?.getTracks().forEach((t) => t.stop());
    setScreenStream(null);
    setIsMicOn(false);
    setIsCameraOn(false);
    setIsScreenSharing(false);
  }, [screenStream]);

  return {
    localStream,
    screenStream,
    localVideoRef,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    stopAll,
  };
}
