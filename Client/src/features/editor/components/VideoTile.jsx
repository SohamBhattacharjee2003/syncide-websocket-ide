import { useRef, useEffect, useState, useCallback } from "react";

/**
 * VideoTile — renders a video stream or fallback avatar.
 *
 * Key design: <video> and avatar are ALWAYS in the DOM.
 * We toggle visibility via CSS to avoid the "black flash" caused
 * by React unmounting/remounting the video element on camera toggle.
 */
export default function VideoTile({ stream, muted = false, initials, color, isCameraOff = false, className = "" }) {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false); // true once first frame renders
  const [videoTrackCount, setVideoTrackCount] = useState(0); // tracks # of video tracks in stream

  // Attach stream to video element whenever stream or element changes
  const attachStream = useCallback((el) => {
    videoRef.current = el;
    if (el && stream) {
      el.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream) {
      console.log(`[VideoTile] Attaching stream ${stream.id} with ${stream.getVideoTracks().length} video tracks`);
      el.srcObject = stream;
      // Handle potential play() interruption
      el.play().catch(err => console.warn("[VideoTile] play() failed:", err));
    } else {
      el.srcObject = null;
      setVideoReady(false);
    }
  }, [stream, videoTrackCount]); // Re-attach if track count changes

  // Check if an active video track exists in the stream
  const hasLiveVideoTrack = stream
    ? stream.getVideoTracks().some(t => t.readyState === "live")
    : false;

  useEffect(() => {
    if (!stream) {
      setVideoTrackCount(0);
      return;
    }
    const update = () => {
      setVideoTrackCount(stream.getVideoTracks().length);
    };
    stream.addEventListener("addtrack", update);
    stream.addEventListener("removetrack", update);
    update();
    return () => {
      stream.removeEventListener("addtrack", update);
      stream.removeEventListener("removetrack", update);
    };
  }, [stream]);

  // Show video only when the camera is flagged as on AND we have a stream attached.
  // We intentionally do NOT gate on hasLiveVideoTrack here because when camera is toggled
  // via track.enabled=false (not stopping the track), readyState stays "live", making
  // that check unreliable. isCameraOff (set by the parent from socket status) is the source of truth.
  const showVideo = !isCameraOff && !!stream;

  return (
    <>
      {/* Video element — always mounted to avoid remount flash */}
      <video
        ref={attachStream}
        autoPlay
        playsInline
        muted={muted}
        onPlaying={() => setVideoReady(true)}
        onPause={() => setVideoReady(false)}
        style={{ display: showVideo ? "block" : "none" }}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />

      {/* Avatar fallback — shown when camera is off or no track yet */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ display: showVideo ? "none" : "flex" }}
      >
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color || "#10b981"}, ${color || "#10b981"}aa)` }}
        >
          {initials || "?"}
        </div>
      </div>
    </>
  );
}
