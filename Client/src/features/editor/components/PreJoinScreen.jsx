import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  VscUnmute,
  VscMute,
  VscClose,
  VscSettings,
  VscCheck,
} from "react-icons/vsc";
import {
  HiOutlineVideoCamera,
  HiOutlineVideoCameraSlash,
  HiOutlineSpeakerWave,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";

export default function PreJoinScreen({
  isOpen,
  onClose,
  onJoin,
  userName,
  roomId,
}) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [devices, setDevices] = useState({ video: [], audio: [] });
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Get available devices
  useEffect(() => {
    async function getDevices() {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(d => d.kind === "videoinput");
        const audioDevices = deviceList.filter(d => d.kind === "audioinput");
        
        setDevices({ video: videoDevices, audio: audioDevices });
        
        if (videoDevices.length > 0) setSelectedVideoDevice(videoDevices[0].deviceId);
        if (audioDevices.length > 0) setSelectedAudioDevice(audioDevices[0].deviceId);
      } catch (err) {
        console.error("Error getting devices:", err);
      }
    }
    
    if (isOpen) {
      getDevices();
    }
  }, [isOpen]);

  // Start media stream
  useEffect(() => {
    async function startStream() {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const constraints = {
          video: {
            deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: {
            deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
          },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        // Set initial state based on what was actually obtained
        if (mediaStream.getVideoTracks().length > 0) {
          mediaStream.getVideoTracks()[0].enabled = isCameraOn;
        }
        if (mediaStream.getAudioTracks().length > 0) {
          mediaStream.getAudioTracks()[0].enabled = isMicOn;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Setup audio level monitoring
        if (mediaStream.getAudioTracks().length > 0) {
          audioContextRef.current = new AudioContext();
          const source = audioContextRef.current.createMediaStreamSource(mediaStream);
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);

          const checkAudioLevel = () => {
            if (analyserRef.current) {
              const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
              analyserRef.current.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
              setAudioLevel(average / 255);
            }
            if (isOpen) requestAnimationFrame(checkAudioLevel);
          };
          checkAudioLevel();
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError(err.name === "NotAllowedError" 
          ? "Camera/microphone access denied. Please allow access in your browser settings."
          : "Could not access camera or microphone. Please check your device settings."
        );
      } finally {
        setIsLoading(false);
      }
    }

    startStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isOpen, isCameraOn, isMicOn, selectedVideoDevice, selectedAudioDevice]);

  // Toggle camera
  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      } else {
        setIsCameraOn(!isCameraOn);
      }
    } else {
      setIsCameraOn(!isCameraOn);
    }
  };

  // Toggle mic
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      } else {
        setIsMicOn(!isMicOn);
      }
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  // Handle join
  const handleJoin = () => {
    // Don't stop the stream - pass it to the parent
    onJoin({ stream, isCameraOn, isMicOn });
  };

  // Handle close
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-semibold text-white">Ready to join?</h2>
            <p className="text-sm text-neutral-500">Room: {roomId}</p>
          </div>
          <motion.button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <VscClose className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-6">
            {/* Video preview */}
            <div className="flex-1">
              <div className="relative aspect-video bg-neutral-900 rounded-xl overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <HiOutlineVideoCameraSlash className="w-12 h-12 text-neutral-600 mb-3" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                ) : isCameraOn && stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-semibold mb-3">
                      {userName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <p className="text-neutral-400 text-sm">Camera is off</p>
                  </div>
                )}

                {/* Camera off overlay */}
                {!isCameraOn && stream && (
                  <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-semibold">
                      {userName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <motion.button
                  onClick={toggleMic}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                    isMicOn 
                      ? "bg-white/10 text-white hover:bg-white/15" 
                      : "bg-red-500/20 text-red-400"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isMicOn ? <VscUnmute className="w-5 h-5" /> : <VscMute className="w-5 h-5" />}
                  <span className="text-sm font-medium">{isMicOn ? "Mute" : "Unmute"}</span>
                </motion.button>

                <motion.button
                  onClick={toggleCamera}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                    isCameraOn 
                      ? "bg-white/10 text-white hover:bg-white/15" 
                      : "bg-red-500/20 text-red-400"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isCameraOn ? (
                    <HiOutlineVideoCamera className="w-5 h-5" />
                  ) : (
                    <HiOutlineVideoCameraSlash className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{isCameraOn ? "Stop Video" : "Start Video"}</span>
                </motion.button>

                <motion.button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    showSettings ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <VscSettings className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Side panel */}
            <div className="w-64 space-y-4">
              {/* Audio level indicator */}
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineSpeakerWave className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-300">Microphone</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`flex-1 h-2 rounded-full ${
                        audioLevel * 10 > i ? "bg-emerald-400" : "bg-white/10"
                      }`}
                      animate={{
                        scaleY: audioLevel * 10 > i ? [1, 1.5, 1] : 1,
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {isMicOn ? "Speak to test your microphone" : "Microphone is muted"}
                </p>
              </div>

              {/* Device settings */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                      <div>
                        <label className="text-xs text-neutral-400 mb-1 block">Camera</label>
                        <select
                          value={selectedVideoDevice}
                          onChange={(e) => setSelectedVideoDevice(e.target.value)}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {devices.video.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Camera ${devices.video.indexOf(device) + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-xs text-neutral-400 mb-1 block">Microphone</label>
                        <select
                          value={selectedAudioDevice}
                          onChange={(e) => setSelectedAudioDevice(e.target.value)}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {devices.audio.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Microphone ${devices.audio.indexOf(device) + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <VscCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-300">Screen sharing available</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      You can share your screen during the call for code review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/2">
          <p className="text-sm text-neutral-500">
            Joining as <span className="text-white">{userName}</span>
          </p>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleClose}
              className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            
            <motion.button
              onClick={handleJoin}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HiOutlineVideoCamera className="w-5 h-5" />
              <span>Join Call</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
