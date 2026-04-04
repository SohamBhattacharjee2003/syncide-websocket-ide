import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  VscUnmute,
  VscMute,
  VscDeviceCameraVideo,
  VscClose,
  VscScreenFull,
  VscScreenNormal,
  VscPinned,
  VscRecord,
  VscStopCircle,
  VscChevronUp,
  VscChevronDown,
} from "react-icons/vsc";
import {
  HiOutlineVideoCamera,
  HiOutlineVideoCameraSlash,
  HiOutlineComputerDesktop,
  HiOutlinePhone,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineHandRaised,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

// Video tile component
const VideoTile = ({ 
  stream, 
  name, 
  isMuted = false, 
  isLocal = false, 
  isScreenShare = false,
  isPinned = false,
  onPin,
  size = "normal" 
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const sizeClasses = {
    small: "w-32 h-24",
    normal: "w-full h-full",
    large: "w-full h-full",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        relative bg-neutral-900 rounded-xl overflow-hidden
        ${sizeClasses[size]}
        ${isPinned ? "ring-2 ring-emerald-400" : ""}
      `}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isMuted}
          className={`w-full h-full object-cover ${isLocal ? "transform -scale-x-100" : ""}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-semibold">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1.5">
          {isMuted && <VscMute className="w-3 h-3 text-red-400" />}
          <span className="text-xs text-white font-medium">
            {isLocal ? "You" : name}
            {isScreenShare && " (Screen)"}
          </span>
        </div>
      </div>

      {/* Pin button */}
      {onPin && !isLocal && (
        <motion.button
          onClick={onPin}
          className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <VscPinned className={`w-4 h-4 ${isPinned ? "text-emerald-400" : ""}`} />
        </motion.button>
      )}

      {/* Speaking indicator */}
      <motion.div
        className="absolute inset-0 rounded-xl ring-2 ring-emerald-400 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
      />
    </motion.div>
  );
};

// Control button component
const ControlButton = ({ icon: IconComponent, label, onClick, active, danger, disabled }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onClick) {
      console.log(`[ControlButton] Clicked: ${label}`);
      onClick();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${danger 
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
          : active 
            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
        }
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <IconComponent className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </motion.button>
  );
};

export default function VideoCall({
  isOpen,
  onClose,
  localStream,
  screenStream,
  remoteStreams = {},
  isCameraOn,
  isMicOn,
  isScreenSharing,
  onToggleCamera,
  onToggleMic,
  onStartScreenShare,
  onStopScreenShare,
  onEndCall,
  users = [],
  userName = "You",
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [pinnedUser, setPinnedUser] = useState(null);
  const [layout] = useState("grid"); // grid, spotlight, sidebar
  const [showParticipants, setShowParticipants] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  const participants = Array.isArray(remoteStreams) 
    ? remoteStreams 
    : remoteStreams instanceof Map 
      ? Array.from(remoteStreams.entries())
      : Object.entries(remoteStreams);

  if (!isOpen) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <div className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Mini video */}
          <div className="relative w-48 h-36">
            <VideoTile
              stream={localStream}
              name={userName}
              isLocal
              isMuted={!isMicOn}
              size="normal"
            />
            
            {/* Expand button */}
            <motion.button
              onClick={() => setIsMinimized(false)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/80"
              whileHover={{ scale: 1.1 }}
            >
              <VscScreenFull className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Mini controls */}
          <div className="flex items-center justify-center gap-2 p-2 bg-black/40">
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[VideoCall] Mic button clicked");
                onToggleMic?.();
              }}
              className={`p-2 rounded-full ${isMicOn ? "bg-white/10" : "bg-red-500/20 text-red-400"}`}
              whileTap={{ scale: 0.9 }}
            >
              {isMicOn ? <VscUnmute className="w-4 h-4" /> : <VscMute className="w-4 h-4" />}
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[VideoCall] Camera button clicked");
                onToggleCamera?.();
              }}
              className={`p-2 rounded-full ${isCameraOn ? "bg-white/10" : "bg-red-500/20 text-red-400"}`}
              whileTap={{ scale: 0.9 }}
            >
              {isCameraOn ? <HiOutlineVideoCamera className="w-4 h-4" /> : <HiOutlineVideoCameraSlash className="w-4 h-4" />}
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[VideoCall] End call button clicked");
                onEndCall?.();
              }}
              className="p-2 rounded-full bg-red-500 text-white"
              whileTap={{ scale: 0.9 }}
            >
              <HiOutlinePhone className="w-4 h-4 rotate-135" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0a0a0a]"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-white font-medium">SyncIDE Meeting</span>
          <span className="text-neutral-500 text-sm">|</span>
          <span className="text-neutral-400 text-sm">{participants.length + 1} participants</span>
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 rounded-full">
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs text-red-400 font-medium">Recording</span>
            </div>
          )}
          
          <motion.button
            onClick={() => setIsMinimized(true)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <VscScreenNormal className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <VscClose className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Main video area */}
      <div className="absolute inset-0 pt-14 pb-24 px-4">
        <div className="h-full flex gap-4">
          {/* Video grid */}
          <div className="flex-1 flex items-center justify-center">
            {layout === "grid" && (
              <div className={`
                grid gap-3 w-full h-full max-w-6xl
                ${participants.length === 0 ? "grid-cols-1" : ""}
                ${participants.length === 1 ? "grid-cols-2" : ""}
                ${participants.length >= 2 && participants.length <= 3 ? "grid-cols-2 grid-rows-2" : ""}
                ${participants.length >= 4 ? "grid-cols-3 grid-rows-2" : ""}
              `}>
                {/* Local video */}
                <div className="group">
                  <VideoTile
                    stream={localStream}
                    name={userName}
                    isLocal
                    isMuted={!isMicOn}
                  />
                </div>

                {/* Screen share (if active) */}
                {isScreenSharing && screenStream && (
                  <div className="col-span-full row-span-1 group">
                    <VideoTile
                      stream={screenStream}
                      name={userName}
                      isScreenShare
                      isLocal
                    />
                  </div>
                )}

                {/* Remote participants */}
                {participants.map(([peerId, data]) => {
                  const stream = data?.stream ?? data;
                  const isMuted = data?.isMicOn === false;
                  return (
                    <div key={peerId} className="group">
                      <VideoTile
                        stream={stream}
                        name={users.find(u => u.id === peerId)?.name || "Participant"}
                        isMuted={isMuted}
                        isPinned={pinnedUser === peerId}
                        onPin={() => setPinnedUser(pinnedUser === peerId ? null : peerId)}
                      />
                    </div>
                  );
                })}

                {/* Empty state */}
                {participants.length === 0 && !localStream && (
                  <div className="flex flex-col items-center justify-center gap-4 text-neutral-500">
                    <HiOutlineUserGroup className="w-16 h-16 opacity-30" />
                    <p className="text-lg">Waiting for others to join...</p>
                    <p className="text-sm">Share the room ID to invite participants</p>
                  </div>
                )}
              </div>
            )}

            {/* Spotlight layout */}
            {layout === "spotlight" && pinnedUser && (
              <div className="w-full h-full flex gap-3">
                <div className="flex-1">
                  <VideoTile
                    stream={remoteStreams instanceof Map ? remoteStreams.get(pinnedUser)?.stream : remoteStreams[pinnedUser]?.stream}
                    name={users.find(u => u.id === pinnedUser)?.name || "Participant"}
                    isPinned
                    size="large"
                  />
                </div>
                <div className="w-48 flex flex-col gap-2 overflow-y-auto">
                  <VideoTile
                    stream={localStream}
                    name={userName}
                    isLocal
                    isMuted={!isMicOn}
                    size="small"
                  />
                  {participants
                    .filter(([id]) => id !== pinnedUser)
                    .map(([peerId, data]) => (
                      <VideoTile
                        key={peerId}
                        stream={data?.stream ?? data}
                        name={users.find(u => u.id === peerId)?.name || "Participant"}
                        size="small"
                        onPin={() => setPinnedUser(peerId)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Participants sidebar */}
          <AnimatePresence>
            {showParticipants && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden"
              >
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-white font-medium">Participants ({participants.length + 1})</h3>
                </div>
                <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                  {/* Local user */}
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{userName} (You)</p>
                      <p className="text-xs text-emerald-400">Host</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isMicOn && <VscMute className="w-4 h-4 text-red-400" />}
                      {!isCameraOn && <HiOutlineVideoCameraSlash className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>

                  {/* Remote participants */}
                  {users.filter(u => u.id !== "local").map((user, index) => (
                    <div key={user.id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{user.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent">
        <div className="h-full flex items-center justify-center gap-3">
          {/* Mic */}
          <ControlButton
            icon={isMicOn ? VscUnmute : VscMute}
            label={isMicOn ? "Mute" : "Unmute"}
            onClick={onToggleMic}
            active={isMicOn}
          />

          {/* Camera */}
          <ControlButton
            icon={isCameraOn ? HiOutlineVideoCamera : HiOutlineVideoCameraSlash}
            label={isCameraOn ? "Stop Video" : "Start Video"}
            onClick={onToggleCamera}
            active={isCameraOn}
          />

          {/* Screen Share */}
          <ControlButton
            icon={HiOutlineComputerDesktop}
            label={isScreenSharing ? "Stop Share" : "Share Screen"}
            onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
            active={isScreenSharing}
          />

          {/* Raise Hand */}
          <ControlButton
            icon={HiOutlineHandRaised}
            label={handRaised ? "Lower Hand" : "Raise Hand"}
            onClick={() => setHandRaised(!handRaised)}
            active={handRaised}
          />

          {/* Participants */}
          <ControlButton
            icon={HiOutlineUserGroup}
            label="Participants"
            onClick={() => setShowParticipants(!showParticipants)}
            active={showParticipants}
          />

          {/* Chat */}
          <ControlButton
            icon={HiOutlineChatBubbleLeftRight}
            label="Chat"
            onClick={() => {}}
          />

          {/* Record */}
          <ControlButton
            icon={isRecording ? VscStopCircle : VscRecord}
            label={isRecording ? "Stop Rec" : "Record"}
            onClick={() => setIsRecording(!isRecording)}
            active={isRecording}
            danger={isRecording}
          />

          {/* Settings */}
          <ControlButton
            icon={HiOutlineCog}
            label="Settings"
            onClick={() => {}}
          />

          {/* Leave/End Call */}
          <motion.button
            onClick={onEndCall}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <HiOutlinePhone className="w-5 h-5 rotate-135" />
            <span>Leave</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
