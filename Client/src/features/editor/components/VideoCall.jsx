import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  VscUnmute,
  VscMute,
  VscClose,
} from "react-icons/vsc";
import {
  HiOutlineVideoCamera,
  HiOutlineVideoCameraSlash,
  HiOutlineComputerDesktop,
  HiOutlinePhone,
} from "react-icons/hi2";

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
  onStartCall,
  onEndCall,
  users = [],
  userName = "You",
}) {
  const participants = Array.from(
    remoteStreams instanceof Map ? remoteStreams.entries() : Object.entries(remoteStreams)
  );

  const allParticipants = [
    {
      id: "local",
      stream: localStream,
      name: userName || "You",
      isLocal: true,
      isCameraOff: !isCameraOn,
      isMicOff: !isMicOn,
      isHost: users.find((u) => u.name === userName)?.isHost || false,
    },
    ...participants
      .filter(([id, data]) => {
        // Only show participants that have valid userName from server
        const userInfo = users.find((u) => u.id === id);
        const hasValidName = data?.userName || userInfo?.name;
        return hasValidName && id !== "local"; // Don't duplicate local user
      })
      .map(([id, data]) => {
        const stream = data?.stream ?? data;
        const userInfo = users.find((u) => u.id === id);
        const participantName = data?.userName || userInfo?.name;

        return {
          id,
          stream,
          name: participantName,
          isLocal: false,
          isCameraOff: !data?.isCameraOn,
          isMicOff: !data?.isMicOn,
          isHost: userInfo?.isHost || false,
        };
      }),
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#202124] z-50 flex flex-col"
      >
        {/* Header */}
        <div className="h-16 bg-[#202124] border-b border-[#3c4043] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3c4043] flex items-center justify-center">
              <HiOutlineVideoCamera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-medium">Video Call</h2>
              <p className="text-[#9aa0a6] text-sm">
                {allParticipants.length} participant{allParticipants.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-[#3c4043] rounded-full text-[#9aa0a6] hover:text-white transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <VscClose className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div
            className={`grid gap-4 h-full ${
              allParticipants.length === 1
                ? "grid-cols-1"
                : allParticipants.length === 2
                ? "grid-cols-2"
                : allParticipants.length <= 4
                ? "grid-cols-2 grid-rows-2"
                : allParticipants.length <= 6
                ? "grid-cols-3 grid-rows-2"
                : "grid-cols-3 grid-rows-3"
            }`}
          >
            {allParticipants.map((participant, index) => (
              <VideoTile
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
        </div>

        {/* Bottom Controls Bar - Google Meet Style */}
        <div className="h-24 bg-[#202124] border-t border-[#3c4043] flex items-center justify-center px-6">
          <div className="flex items-center gap-4">
            {/* Microphone */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                onClick={onToggleMic}
                className={`p-4 rounded-full transition-all ${
                  isMicOn
                    ? "bg-[#3c4043] hover:bg-[#5f6368] text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMicOn ? <VscUnmute className="w-6 h-6" /> : <VscMute className="w-6 h-6" />}
              </motion.button>
              <span className="text-xs text-[#9aa0a6]">{isMicOn ? "Mute" : "Unmute"}</span>
            </div>

            {/* Camera */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                onClick={onToggleCamera}
                className={`p-4 rounded-full transition-all ${
                  isCameraOn
                    ? "bg-[#3c4043] hover:bg-[#5f6368] text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCameraOn ? (
                  <HiOutlineVideoCamera className="w-6 h-6" />
                ) : (
                  <HiOutlineVideoCameraSlash className="w-6 h-6" />
                )}
              </motion.button>
              <span className="text-xs text-[#9aa0a6]">{isCameraOn ? "Stop video" : "Start video"}</span>
            </div>

            {/* Screen Share */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
                className={`p-4 rounded-full transition-all ${
                  isScreenSharing
                    ? "bg-[#1a73e8] hover:bg-[#1765cc] text-white"
                    : "bg-[#3c4043] hover:bg-[#5f6368] text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <HiOutlineComputerDesktop className="w-6 h-6" />
              </motion.button>
              <span className="text-xs text-[#9aa0a6]">
                {isScreenSharing ? "Stop presenting" : "Present now"}
              </span>
            </div>

            {/* End Call */}
            <div className="flex flex-col items-center gap-2 ml-4">
              <motion.button
                onClick={onEndCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <HiOutlinePhone className="w-6 h-6 rotate-[135deg]" />
              </motion.button>
              <span className="text-xs text-[#9aa0a6]">Leave call</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Video tile component
function VideoTile({ stream, name, isLocal, isMuted, isCameraOff, isHost, index }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Ensure video plays
      videoRef.current.play().catch(e => console.log('[VideoTile] Play error:', e));
    }
  }, [stream]);

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
      className="relative w-full h-full rounded-2xl overflow-hidden bg-[#3c4043] shadow-2xl"
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
            className={`w-24 h-24 rounded-full bg-gradient-to-br ${
              gradients[index % gradients.length]
            } flex items-center justify-center text-white text-4xl font-bold shadow-2xl`}
          >
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Name and status */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-2 bg-black/70 backdrop-blur-md rounded-lg">
          {isMuted && <VscMute className="w-4 h-4 text-red-400" />}
          <span className="text-sm text-white font-medium truncate max-w-[200px]">
            {isLocal ? "You" : name}
          </span>
          {isHost && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
              Host
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
