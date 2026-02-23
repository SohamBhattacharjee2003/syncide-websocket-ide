import { useRef, useEffect } from "react";

/**
 * VideoTile — renders a video stream or fallback avatar in a participant tile.
 *
 * Props:
 *  - stream      (MediaStream | null) — the video/audio stream to render
 *  - muted       (boolean) — whether to mute the video (true for local)
 *  - initials    (string) — fallback initials when no video
 *  - color       (string) — avatar background color
 *  - className   (string) — extra classes for the video
 */
export default function VideoTile({ stream, muted = false, initials, color, className = "" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Check if the stream has an active video track
  const hasVideo = stream && stream.getVideoTracks().some((t) => t.enabled && t.readyState === "live");

  if (hasVideo) {
    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />
    );
  }

  // Fallback: show initials avatar
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color || "#10b981"}, ${color || "#10b981"}aa)` }}
      >
        {initials || "?"}
      </div>
    </div>
  );
}
