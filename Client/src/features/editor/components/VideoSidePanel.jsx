import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  VscUnmute,
  VscMute,
  VscChevronRight,
  VscPinned,
  VscRecord,
  VscScreenFull,
  VscSettingsGear,
} from "react-icons/vsc";
import {
  HiOutlineVideoCamera,
  HiOutlineVideoCameraSlash,
  HiOutlineComputerDesktop,
  HiOutlinePhone,
  HiOutlineSparkles,
  HiOutlineSignal,
} from "react-icons/hi2";

export default function VideoSidePanel({
  isOpen,
  onToggle,
  localStream,
  remoteStreams = {},
  isCameraOn,
  isMicOn,
  isScreenSharing,
  onToggleCamera,
  onToggleMic,
  onStartScreenShare,
  onStopScreenShare,
  onStartCall,
  onEndCall,
  onOpenFullscreen,
  isInCall,
  users = [],
  userName = "You",
}) {
  const localVideoRef = useRef(null);
  const [pinnedUser, setPinnedUser] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const participants = Array.from(
    remoteStreams instanceof Map ? remoteStreams.entries() : Object.entries(remoteStreams)
  );
  const allParticipants = [
    { 
      id: "local", 
      stream: localStream, 
      name: userName, 
      isLocal: true,
      isCameraOff: !isCameraOn
    },
    ...participants.map(([id, data]) => ({
      id,
      stream: data?.stream ?? data,
      name: data?.userName || users.find((u) => u.id === id)?.name || "Participant",
      isLocal: false,
      isCameraOff: !data?.isCameraOn,
    })),
  ];

  // Collapsed state
  if (!isOpen) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 52 }}
        className="h-full bg-[#080808] border-l border-white/5 flex flex-col items-center py-4"
      >
        <motion.button
          onClick={onToggle}
          className="relative p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiOutlineVideoCamera className="w-5 h-5" />
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.2 }}
          />
        </motion.button>

        {isInCall && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-emerald-400"
              animate={{ 
                scale: [1, 1.3, 1],
                boxShadow: ["0 0 0 0 rgba(16,185,129,0.4)", "0 0 0 8px rgba(16,185,129,0)", "0 0 0 0 rgba(16,185,129,0)"]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[VideoSidePanel] Mic button clicked");
                onToggleMic?.();
              }}
              className={`p-2 rounded-lg transition-all ${
                isMicOn ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-red-400 bg-red-500/20"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isMicOn ? <VscUnmute className="w-4 h-4" /> : <VscMute className="w-4 h-4" />}
            </motion.button>
            
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[VideoSidePanel] Camera button clicked");
                onToggleCamera?.();
              }}
              className={`p-2 rounded-lg transition-all ${
                isCameraOn ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-red-400 bg-red-500/20"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isCameraOn ? (
                <HiOutlineVideoCamera className="w-4 h-4" />
              ) : (
                <HiOutlineVideoCameraSlash className="w-4 h-4" />
              )}
            </motion.button>

            <div className="w-6 h-px bg-white/10 my-1" />

            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[VideoSidePanel] End call button clicked");
                onEndCall?.();
              }}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <HiOutlinePhone className="w-4 h-4 rotate-[135deg]" />
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full bg-[#080808] border-l border-white/5 flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
              animate={isInCall ? { 
                boxShadow: ["0 0 15px rgba(16,185,129,0.3)", "0 0 25px rgba(16,185,129,0.5)", "0 0 15px rgba(16,185,129,0.3)"]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <HiOutlineVideoCamera className="w-5 h-5 text-white" />
              {isInCall && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080808]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-white">Video Call</h3>
              <div className="flex items-center gap-2">
                {isInCall ? (
                  <motion.div
                    className="flex items-center gap-1"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <HiOutlineSignal className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {allParticipants.length} in call
                    </span>
                  </motion.div>
                ) : (
                  <span className="text-[11px] text-neutral-500">Ready to connect</span>
                )}
              </div>
            </div>
          </div>
          
          <motion.button
            onClick={onToggle}
            className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <VscChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!isInCall ? (
          /* Not in call - Join screen */
          <motion.div
            key="join"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Preview Area */}
            <div className="p-4">
              <motion.div
                className="relative aspect-video rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#0a0a0a] to-neutral-900">
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 30% 40%, rgba(16,185,129,0.08) 0%, transparent 60%),
                                   radial-gradient(circle at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 60%)`,
                    }}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  {/* Subtle grid */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                      backgroundSize: '24px 24px',
                    }}
                  />
                </div>

                {/* Avatar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Glow ring */}
                    <motion.div
                      className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    
                    <motion.div
                      className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
                      animate={{ 
                        boxShadow: [
                          "0 10px 40px -10px rgba(16,185,129,0.4)",
                          "0 10px 60px -10px rgba(16,185,129,0.6)",
                          "0 10px 40px -10px rgba(16,185,129,0.4)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {userName?.charAt(0)?.toUpperCase() || "?"}
                    </motion.div>
                    
                    {/* Orbiting elements */}
                    <motion.div
                      className="absolute -inset-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400/70" />
                    </motion.div>
                    <motion.div
                      className="absolute -inset-8"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Bottom label */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] text-white/70">Camera ready</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Features & Action */}
            <div className="flex-1 flex flex-col px-4 pb-4">
              {/* Features grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <FeatureCard icon={HiOutlineVideoCamera} label="HD Video" desc="Crystal clear" />
                <FeatureCard icon={VscUnmute} label="Audio" desc="Low latency" />
                <FeatureCard icon={HiOutlineComputerDesktop} label="Screen Share" desc="Monitor ready" />
                <FeatureCard icon={VscRecord} label="Recording" desc="Save sessions" />
              </div>

              {/* Start button */}
              <motion.button
                onClick={onStartCall}
                className="relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500"
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                />
                <span className="relative flex items-center justify-center gap-2">
                  <HiOutlineVideoCamera className="w-5 h-5" />
                  Start Video Call
                </span>
              </motion.button>

              {/* Tip box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <HiOutlineSparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-300/90 font-medium mb-0.5">Interview Mode</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Screen sharing lets interviewers monitor your coding session in real-time.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* In call - Video grid */
          <motion.div
            key="call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Participants */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
              {allParticipants.map((participant, index) => (
                <VideoTile
                  key={participant.id}
                  stream={participant.stream}
                  name={participant.name}
                  isLocal={participant.isLocal}
                  isMuted={participant.isLocal ? !isMicOn : false}
                  isCameraOff={participant.isCameraOff}
                  isPinned={pinnedUser === participant.id}
                  onPin={() => setPinnedUser(
                    pinnedUser === participant.id ? null : participant.id
                  )}
                  index={index}
                />
              ))}

              {/* Waiting indicator */}
              {participants.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent border border-dashed border-white/10 text-center"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <HiOutlineSignal className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-sm text-neutral-400 font-medium">Waiting for others</p>
                  <p className="text-xs text-neutral-600 mt-1">Share the room ID to invite participants</p>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent">
              {/* Control buttons */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <ControlButton
                  icon={isMicOn ? VscUnmute : VscMute}
                  active={isMicOn}
                  danger={!isMicOn}
                  onClick={onToggleMic}
                  tooltip={isMicOn ? "Mute" : "Unmute"}
                />
                <ControlButton
                  icon={isCameraOn ? HiOutlineVideoCamera : HiOutlineVideoCameraSlash}
                  active={isCameraOn}
                  danger={!isCameraOn}
                  onClick={onToggleCamera}
                  tooltip={isCameraOn ? "Stop Video" : "Start Video"}
                />
                <ControlButton
                  icon={HiOutlineComputerDesktop}
                  active={isScreenSharing}
                  onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
                  tooltip={isScreenSharing ? "Stop Share" : "Screen Share"}
                />
                <ControlButton
                  icon={VscScreenFull}
                  onClick={onOpenFullscreen}
                  tooltip="Fullscreen"
                />
                <ControlButton
                  icon={VscSettingsGear}
                  onClick={() => {}}
                  tooltip="Settings"
                />
              </div>

              {/* Leave button */}
              <motion.button
                onClick={onEndCall}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-medium transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <HiOutlinePhone className="w-4 h-4 rotate-[135deg]" />
                <span>Leave Call</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Feature card for join screen
function FeatureCard({ icon: Icon, label, desc }) {
  return (
    <motion.div
      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all cursor-default"
      whileHover={{ scale: 1.02 }}
    >
      <Icon className="w-4 h-4 text-emerald-400 mb-1.5" />
      <p className="text-xs text-white font-medium">{label}</p>
      <p className="text-[10px] text-neutral-500">{desc}</p>
    </motion.div>
  );
}

// Video tile component
function VideoTile({ stream, name, isLocal, isMuted, isCameraOff, isPinned, onPin, index, isSpeaking = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const gradients = [
    "from-emerald-500 to-cyan-500",
    "from-violet-500 to-purple-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
      className={`relative aspect-video rounded-xl overflow-hidden group cursor-pointer ${
        isPinned ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#080808]" : ""
      }`}
    >
      {/* Video or Avatar */}
      {stream && !isCameraOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? "transform -scale-x-100" : ""}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 via-[#0a0a0a] to-neutral-900">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(16,185,129,0.1) 0%, transparent 70%)`,
            }}
          />
          <motion.div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white text-lg font-bold shadow-xl`}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {name?.charAt(0)?.toUpperCase() || "?"}
          </motion.div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      {/* Name badge */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
          {isMuted && <VscMute className="w-3 h-3 text-red-400" />}
          <span className="text-xs text-white font-medium">
            {isLocal ? "You" : name}
          </span>
          {isLocal && (
            <motion.div 
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Pin button */}
      {!isLocal && onPin && (
        <motion.button
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.8)" }}
          whileTap={{ scale: 0.9 }}
        >
          <VscPinned className={`w-3.5 h-3.5 ${isPinned ? "text-emerald-400" : "text-white"}`} />
        </motion.button>
      )}

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      />

      {/* Speaking indicator ring — only when isSpeaking prop is true */}
      {isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-emerald-400/60 pointer-events-none"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// Control button
function ControlButton({ icon: Icon, onClick, active, danger, tooltip }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[VideoSidePanel.ControlButton] Clicked: ${tooltip}`);
    if (onClick) {
      onClick();
    } else {
      console.warn(`[VideoSidePanel.ControlButton] No onClick handler for ${tooltip}`);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`relative p-3 rounded-xl transition-all ${
        danger
          ? "text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
          : active
          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
          : "text-neutral-400 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:text-white hover:border-white/10"
      }`}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  );
}
