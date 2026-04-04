import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  VscUnmute,
  VscMute,
  VscChevronRight,
} from "react-icons/vsc";
import {
  HiOutlineVideoCamera,
  HiOutlineVideoCameraSlash,
  HiOutlineComputerDesktop,
  HiOutlinePhone,
} from "react-icons/hi2";

export default function VideoSidePanel({
  isOpen,
  onToggle,
  localStream,
  remoteStreams = {},
  peerStatuses = new Map(),
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

  const participants = Array.from(
    remoteStreams instanceof Map ? remoteStreams.entries() : Object.entries(remoteStreams)
  );
  
  console.log('[VideoSidePanel] Remote streams:', remoteStreams);
  console.log('[VideoSidePanel] Participants array:', participants);
  console.log('[VideoSidePanel] Users from socket:', users);
  console.log('[VideoSidePanel] Peer statuses:', peerStatuses);
  
  const allParticipants = [
    { 
      id: "local", 
      stream: localStream, 
      name: userName || "You", 
      isLocal: true,
      isCameraOff: !isCameraOn,
      isMicOff: !isMicOn,
      isHost: users.find(u => u.name === userName)?.isHost || false
    },
    ...participants
      .filter(([id, data]) => {
        // Show ALL remote participants, don't filter by stream availability
        const userInfo = users.find(u => u.id === id);
        const hasValidName = (data?.userName && data.userName !== "Participant") || userInfo?.name;
        
        console.log(`[VideoSidePanel] Checking peer ${id}:`, {
          hasValidName,
          userName: data?.userName,
          userInfoName: userInfo?.name,
          hasStream: !!data?.stream
        });
        
        // Only filter out if it's the local user or has no valid name
        return hasValidName && id !== "local";
      })
      .map(([id, data]) => {
        const stream = data?.stream ?? data;
        const userInfo = users.find(u => u.id === id);
        const participantName = data?.userName || userInfo?.name || "Participant";
        const peerStatus = peerStatuses?.get?.(id) || {};
        
        return {
          id,
          stream,
          name: participantName,
          isLocal: false,
          isCameraOff: !peerStatus.isCameraOn, // If undefined or false, camera is off
          isMicOff: !peerStatus.isMicOn,
          isHost: userInfo?.isHost || false
        };
      }),
  ];

  // Collapsed state
  if (!isOpen) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 56 }}
        className="h-full bg-[#202124] border-l border-[#3c4043] flex flex-col items-center py-4 gap-3"
      >
        <motion.button
          onClick={onToggle}
          className="p-3 rounded-full hover:bg-[#3c4043] text-white transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiOutlineVideoCamera className="w-5 h-5" />
        </motion.button>

        {isInCall && (
          <>
            <div className="w-8 h-px bg-[#3c4043]" />
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMic?.();
              }}
              className={`p-3 rounded-full transition-all ${
                isMicOn ? "hover:bg-[#3c4043] text-white" : "bg-red-600 text-white"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isMicOn ? <VscUnmute className="w-5 h-5" /> : <VscMute className="w-5 h-5" />}
            </motion.button>
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCamera?.();
              }}
              className={`p-3 rounded-full transition-all ${
                isCameraOn ? "hover:bg-[#3c4043] text-white" : "bg-red-600 text-white"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isCameraOn ? (
                <HiOutlineVideoCamera className="w-5 h-5" />
              ) : (
                <HiOutlineVideoCameraSlash className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onEndCall?.();
              }}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <HiOutlinePhone className="w-5 h-5 rotate-[135deg]" />
            </motion.button>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 360, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full bg-[#202124] border-l border-[#3c4043] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#3c4043] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3c4043] flex items-center justify-center">
            <HiOutlineVideoCamera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Video Call</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#9aa0a6]">
                {allParticipants.length} participant{allParticipants.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={onToggle}
          className="p-2 text-[#9aa0a6] hover:text-white hover:bg-[#3c4043] rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
        >
          <VscChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Always show participants - no join prompt */}
        <motion.div
          key="call"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Participants List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {allParticipants.map((participant, index) => (
              <ParticipantTile
                key={participant.id}
                stream={participant.stream}
                name={participant.name}
                isLocal={participant.isLocal}
                isMuted={participant.isMicOff}
                isCameraOff={participant.isCameraOff}
                isHost={participant.isHost}
                index={index}
              />
            ))}
          </div>

          {/* Google Meet Style Controls - Fixed at Bottom */}
          <div className="p-4 bg-[#202124] border-t border-[#3c4043] flex-shrink-0">
            {/* Control buttons */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <ControlButton
                icon={isMicOn ? VscUnmute : VscMute}
                active={isMicOn}
                danger={!isMicOn}
                onClick={() => {
                  console.log('[VideoSidePanel] Mic button clicked, current state:', isMicOn);
                  onToggleMic?.();
                }}
                tooltip={isMicOn ? "Mute" : "Unmute"}
              />
              <ControlButton
                icon={isCameraOn ? HiOutlineVideoCamera : HiOutlineVideoCameraSlash}
                active={isCameraOn}
                danger={!isCameraOn}
                onClick={() => {
                  console.log('[VideoSidePanel] Camera button clicked, current state:', isCameraOn);
                  onToggleCamera?.();
                }}
                tooltip={isCameraOn ? "Stop" : "Start"}
              />
              <ControlButton
                icon={HiOutlineComputerDesktop}
                active={isScreenSharing}
                onClick={() => {
                  console.log('[VideoSidePanel] Screen share button clicked');
                  (isScreenSharing ? onStopScreenShare : onStartScreenShare)?.();
                }}
                tooltip={isScreenSharing ? "Stop" : "Present"}
              />
              <ControlButton
                icon={HiOutlinePhone}
                danger={true}
                onClick={() => {
                  console.log('[VideoSidePanel] End call button clicked');
                  onEndCall?.();
                }}
                tooltip="Leave"
                rotate={true}
              />
            </div>

            {/* Control Labels */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-[#9aa0a6]">
              <span className="w-12 text-center">{isMicOn ? "Mute" : "Unmute"}</span>
              <span className="w-12 text-center">{isCameraOn ? "Stop" : "Start"}</span>
              <span className="w-12 text-center">{isScreenSharing ? "Stop" : "Present"}</span>
              <span className="w-12 text-center">Leave</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Participant tile component - Google Meet style
function ParticipantTile({ stream, name, isLocal, isMuted, isCameraOff, isHost, index }) {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log(`[ParticipantTile] ${name}: stream=${!!stream}, isCameraOff=${isCameraOff}, tracks=${stream?.getTracks().length}`);
    if (videoRef.current && stream) {
      console.log(`[ParticipantTile] Setting srcObject for ${name}`);
      videoRef.current.srcObject = stream;
    }
  }, [stream, name, isCameraOff]);

  const gradients = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-pink-600",
    "from-teal-500 to-teal-600",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative aspect-video rounded-xl overflow-hidden bg-[#3c4043] group"
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
        <div className="w-full h-full flex items-center justify-center bg-[#3c4043]">
          <div 
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white text-xl font-semibold shadow-lg`}
          >
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* Name and status */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
          {isMuted && <VscMute className="w-3.5 h-3.5 text-red-400" />}
          <span className="text-xs text-white font-medium truncate max-w-[120px]">
            {isLocal ? "You" : name}
          </span>
          {isHost && (
            <span className="px-1.5 py-0.5 bg-blue-500/80 text-white text-[9px] rounded font-medium">
              Host
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Control button - Google Meet style
function ControlButton({ icon: Icon, onClick, active, danger, tooltip, rotate }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[ControlButton] ${tooltip} clicked, active=${active}, danger=${danger}`);
    if (onClick) {
      console.log(`[ControlButton] Calling onClick handler for ${tooltip}`);
      onClick();
    } else {
      console.warn(`[ControlButton] No onClick handler for ${tooltip}`);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`relative p-3 rounded-full transition-all ${
        danger
          ? "bg-red-600 hover:bg-red-700 text-white"
          : active
          ? "bg-[#1a73e8] hover:bg-[#1765cc] text-white"
          : "bg-[#3c4043] hover:bg-[#5f6368] text-white"
      }`}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      title={tooltip}
    >
      <Icon className={`w-4 h-4 ${rotate ? "rotate-[135deg]" : ""}`} />
    </motion.button>
  );
}
