import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useMediaStream — manages local mic, camera, and screen sharing streams.
 *
 * KEY: Auto-acquires a MUTED audio stream on mount so that WebRTC peer
 * connections always have a real audio track from the start.
 */
export default function useMediaStream() {
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef(null);

  // ★ Auto-acquire mic on mount (muted) so WebRTC always has an audio track
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        // Start muted — user clicks mic button to unmute
        stream.getAudioTracks().forEach((t) => (t.enabled = false));
        setLocalStream(stream);
        setIsMicOn(false);
        console.log("[useMediaStream] auto-acquired muted mic stream");
      } catch (err) {
        console.warn("[useMediaStream] could not auto-acquire mic:", err.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Start mic + camera (used when toggling camera ON or replacing stream)
  const startMedia = useCallback(async ({ audio = true, video = true } = {}) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
      // Stop old tracks before replacing
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsMicOn(audio);
      setIsCameraOn(video);
      return stream;
    } catch (err) {
      console.error("[useMediaStream] getUserMedia failed:", err);
      return null;
    }
  }, [localStream]);

  // Toggle microphone — just flips track.enabled (no new stream needed)
  const toggleMic = useCallback(() => {
    if (!localStream) {
      startMedia({ audio: true, video: isCameraOn });
      return;
    }
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      startMedia({ audio: true, video: isCameraOn });
      return;
    }
    const newState = !audioTracks[0].enabled;
    audioTracks.forEach((t) => (t.enabled = newState));
    setIsMicOn(newState);
  }, [localStream, isCameraOn, startMedia]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (!localStream) {
      startMedia({ audio: isMicOn, video: true });
      return;
    }
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      // Need to get a new stream with video
      startMedia({ audio: isMicOn, video: true });
      return;
    }
    const newState = !videoTracks[0].enabled;
    videoTracks.forEach((t) => (t.enabled = newState));
    setIsCameraOn(newState);
  }, [localStream, isMicOn, startMedia]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setScreenStream(null);
        setIsScreenSharing(false);
      });
      setScreenStream(stream);
      setIsScreenSharing(true);
      return stream;
    } catch (err) {
      console.error("[useMediaStream] getDisplayMedia failed:", err);
      return null;
    }
  }, [isScreenSharing, screenStream]);

  // Cleanup
  const stopAll = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    setIsMicOn(false);
    setIsCameraOn(false);
    setIsScreenSharing(false);
  }, [localStream, screenStream]);

  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
