import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  VscUnmute,
  VscMute,
  VscClose,
  VscChevronUp,
  VscChevronDown,
} from "react-icons/vsc";
import {
  HiOutlineVideoCamera,
  HiOutlineVideoCameraSlash,
  HiOutlineComputerDesktop,
  HiOutlinePhone,
  HiOutlineArrowsPointingOut,
} from "react-icons/hi2";

export default function VideoPanel({
  isExpanded,
  onToggleExpand,
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

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const participants = Object.entries(remoteStreams).filter(([id]) => id !== "local");

  return (
    <motion.div
      initial={{ height: 48 }}
      animate={{ height: isExpanded ? 280 : 48 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-[#0a0a0a] border-t border-white/5 overflow-hidden"
    >
      {/* Header */}
      <div
        className="h-12 flex items-center justify-between px-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <HiOutlineVideoCamera className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-white font-medium">Video Call</span>
          
          {isInCall && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 rounded-full">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[10px] text-emerald-400">In Call</span>
            </div>
          )}
          
          <span className="text-xs text-neutral-500">
            {participants.length + (localStream ? 1 : 0)} participant{participants.length !== 0 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isInCall && (
            <>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMic?.();
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isMicOn ? "text-neutral-400 hover:text-white" : "text-red-400 bg-red-500/20"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMicOn ? <VscUnmute className="w-4 h-4" /> : <VscMute className="w-4 h-4" />}
              </motion.button>
              
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCamera?.();
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isCameraOn ? "text-neutral-400 hover:text-white" : "text-red-400 bg-red-500/20"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isCameraOn ? (
                  <HiOutlineVideoCamera className="w-4 h-4" />
                ) : (
                  <HiOutlineVideoCameraSlash className="w-4 h-4" />
                )}
              </motion.button>
            </>
          )}
          
          {isExpanded ? (
            <VscChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <VscChevronUp className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[calc(100%-48px)] p-3"
          >
            {!isInCall ? (
              /* Not in call - Join prompt */
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <HiOutlineVideoCamera className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 mb-1">Start a video call</p>
                  <p className="text-neutral-600 text-sm">Connect with your team in real-time</p>
                </div>
                
                <motion.button
                  onClick={onStartCall}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <HiOutlineVideoCamera className="w-5 h-5" />
                  <span>Join Call</span>
                </motion.button>
              </div>
            ) : (
              /* In call - Video grid */
              <div className="h-full flex flex-col gap-3">
                {/* Video grid */}
                <div className="flex-1 flex gap-2 overflow-hidden">
                  {/* Local video */}
                  <div className="relative flex-1 bg-neutral-900 rounded-lg overflow-hidden min-w-[120px]">
                    {localStream ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-lg font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    {/* Labels */}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
                      You {!isMicOn && "🔇"}
                    </div>
                    
                    {!isCameraOn && (
                      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-lg font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remote participants */}
                  {participants.slice(0, 3).map(([oderId, stream]) => (
                    <RemoteVideo
                      key={oderId}
                      stream={stream}
                      name={users.find(u => u.id === oderId)?.name || "Participant"}
                    />
                  ))}

                  {/* More participants indicator */}
                  {participants.length > 3 && (
                    <div className="w-24 bg-neutral-900 rounded-lg flex items-center justify-center">
                      <span className="text-neutral-400 text-sm">+{participants.length - 3}</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                  <motion.button
                    onClick={onToggleMic}
                    className={`p-2 rounded-lg transition-colors ${
                      isMicOn ? "bg-white/10 text-white" : "bg-red-500/20 text-red-400"
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isMicOn ? <VscUnmute className="w-4 h-4" /> : <VscMute className="w-4 h-4" />}
                  </motion.button>
                  
                  <motion.button
                    onClick={onToggleCamera}
                    className={`p-2 rounded-lg transition-colors ${
                      isCameraOn ? "bg-white/10 text-white" : "bg-red-500/20 text-red-400"
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isCameraOn ? (
                      <HiOutlineVideoCamera className="w-4 h-4" />
                    ) : (
                      <HiOutlineVideoCameraSlash className="w-4 h-4" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
                    className={`p-2 rounded-lg transition-colors ${
                      isScreenSharing ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white"
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <HiOutlineComputerDesktop className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={onOpenFullscreen}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <HiOutlineArrowsPointingOut className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={onEndCall}
                    className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <HiOutlinePhone className="w-4 h-4 rotate-135" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Remote video component
function RemoteVideo({ stream, name }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Ensure video plays
      videoRef.current.play().catch(e => console.log('[RemoteVideo] Play error:', e));
    }
  }, [stream]);

  return (
    <div className="relative flex-1 bg-neutral-900 rounded-lg overflow-hidden min-w-[120px]">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
        {name}
      </div>
    </div>
  );
}
