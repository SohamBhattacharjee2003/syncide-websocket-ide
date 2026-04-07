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
  const persistentStreamRef = useRef(new MediaStream()); // Initialize immediately with empty stream
  const [localStream, setLocalStream] = useState(() => new MediaStream()); // Initialize state with empty stream
  const [screenStream, setScreenStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef(null);

  // ── Initialize on mount: ensure stream exists ──
  useEffect(() => {
    console.log("[useMediaStream] Initialized with empty stream");

    // Cleanup on unmount
    return () => {
      console.log("[useMediaStream] Cleaning up all tracks");
      persistentStreamRef.current?.getTracks().forEach((t) => {
        t.stop();
        console.log(`[useMediaStream] Stopped track: ${t.kind}`);
      });
      screenStream?.getTracks().forEach((t) => t.stop());
    };
  }, [screenStream]);

  // ── Toggle microphone ──
  const toggleMic = useCallback(async () => {
    console.log("[useMediaStream.toggleMic] Called");
    
    // Ensure stream exists
    if (!persistentStreamRef.current) {
      console.warn("[useMediaStream] Stream was null, creating new one");
      const newStream = new MediaStream();
      persistentStreamRef.current = newStream;
      setLocalStream(newStream);
    }
    
    const stream = persistentStreamRef.current;
    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length > 0) {
      // Audio track exists - check if we're turning OFF
      const currentState = audioTracks[0].enabled;
      
      if (currentState) {
        // Turning OFF - completely stop the track
        console.log("[useMediaStream] Stopping mic track");
        audioTracks.forEach((t) => {
          t.stop();
          stream.removeTrack(t);
        });
        setIsMicOn(false);
        setLocalStream(new MediaStream(stream.getTracks()));
        console.log("[useMediaStream] Mic stopped");
      } else {
        // Turning ON - need to request mic again
        try {
          console.log("[useMediaStream] Re-requesting audio permission...");
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
              echoCancellation: true, 
              noiseSuppression: true,
              autoGainControl: true
            } 
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
          console.log("[useMediaStream] Mic re-enabled");
        } catch (err) {
          console.error("[useMediaStream] Cannot re-access mic:", err);
          setIsMicOn(false);
        }
      }
    } else {
      // First time - acquire audio
      try {
        console.log("[useMediaStream] Requesting audio permission...");
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true,
            autoGainControl: true
          } 
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
    }
  }, []);

  // ── Toggle camera ──
  const toggleCamera = useCallback(async () => {
    console.log("[useMediaStream.toggleCamera] Called");
    
    // Ensure stream exists
    if (!persistentStreamRef.current) {
      console.warn("[useMediaStream] Stream was null, creating new one");
      const newStream = new MediaStream();
      persistentStreamRef.current = newStream;
      setLocalStream(newStream);
    }
    
    const stream = persistentStreamRef.current;
    const videoTracks = stream.getVideoTracks();

    if (videoTracks.length > 0) {
      // Camera track exists — check if we're turning OFF
      const currentState = videoTracks[0].enabled;
      
      if (currentState) {
        // Turning OFF - completely stop the track to release camera
        console.log("[useMediaStream] Stopping camera track to release hardware");
        videoTracks.forEach((t) => {
          t.stop();
          stream.removeTrack(t);
        });
        setIsCameraOn(false);
        setLocalStream(new MediaStream(stream.getTracks()));
        console.log("[useMediaStream] Camera stopped and released");
      } else {
        // Turning ON - need to request camera again
        try {
          console.log("[useMediaStream] Re-requesting camera permission...");
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
          console.log("[useMediaStream] Camera re-enabled");
        } catch (err) {
          console.error("[useMediaStream] Cannot re-access camera:", err);
          setIsCameraOn(false);
        }
      }
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
    console.log("[useMediaStream] stopAll called");
    
    // Stop all tracks in persistent stream
    if (persistentStreamRef.current) {
      persistentStreamRef.current.getTracks().forEach((t) => {
        console.log(`[useMediaStream] Stopping ${t.kind} track, state: ${t.readyState}`);
        t.stop();
        t.enabled = false;
      });
      // DON'T set to null - create a fresh empty stream instead
      const newStream = new MediaStream();
      persistentStreamRef.current = newStream;
      setLocalStream(newStream);
    }
    
    // Stop screen share
    if (screenStream) {
      screenStream.getTracks().forEach((t) => {
        console.log(`[useMediaStream] Stopping screen track`);
        t.stop();
      });
      setScreenStream(null);
    }
    
    setIsMicOn(false);
    setIsCameraOn(false);
    setIsScreenSharing(false);
    
    console.log("[useMediaStream] All tracks stopped, stream reset to empty");
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
