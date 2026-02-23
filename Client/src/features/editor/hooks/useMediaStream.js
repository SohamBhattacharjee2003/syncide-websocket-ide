import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useMediaStream — manages local mic, camera, and screen sharing streams.
 *
 * Returns:
 *  - localStream         (MediaStream | null)
 *  - screenStream        (MediaStream | null)
 *  - localVideoRef       (ref to attach to a <video> element)
 *  - isMicOn / isCameraOn / isScreenSharing (booleans)
 *  - toggleMic / toggleCamera / toggleScreenShare (functions)
 *  - stopAll             (cleanup function)
 */
export default function useMediaStream() {
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef(null);

  // Start mic + camera
  const startMedia = useCallback(async ({ audio = true, video = true } = {}) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
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
  }, []);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (!localStream) {
      // Start with mic only
      startMedia({ audio: true, video: isCameraOn });
      return;
    }
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      // No audio track yet — restart with audio
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
      // When user clicks browser's "stop sharing" button
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

  // Cleanup on unmount
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
    return () => {
      // Cleanup on unmount
      stopAll();
    };
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
