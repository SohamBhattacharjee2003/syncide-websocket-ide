import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import JoinRoomModal from "../components/JoinRoomModal";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../../../shared/socket/socket";
import { useAuth } from "../../../shared/context/AuthContext";

// Components
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import EditorPane from "../components/EditorPane";
import RightPanel from "../components/RightPanel";
import StatusBar from "../components/StatusBar";
import Terminal from "../components/Terminal";
import VideoCall from "../components/VideoCall";
import VideoSidePanel from "../components/VideoSidePanel";
import PreJoinScreen from "../components/PreJoinScreen";

// Hooks
import useWebRTC from "../hooks/useWebRTC";
import useMediaStream from "../hooks/useMediaStream";

// Sample users for demo - in production, these come from socket
// Remove mockUsers. In production, users come from socket events.

// Remove mockMessages. In production, messages come from socket or backend.
const mockMessages = [];

// Language-specific boilerplate code
const boilerplates = {
  javascript: `// Welcome to SyncIDE! 🚀
// Start coding collaboratively...

function greet(name) {
  return \`Hello, \${name}! Welcome to the collaborative IDE.\`;
}

const users = ["Alex", "Sarah", "Mike"];

users.forEach((user) => {
  console.log(greet(user));
});

// Try editing this code and see it sync in real-time!
`,
  typescript: `// Welcome to SyncIDE! 🚀
// TypeScript - Start coding with type safety

interface User {
  id: number;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! Welcome to the collaborative IDE.\`;
}

const users: User[] = [
  { id: 1, name: "Alex", email: "alex@example.com" },
  { id: 2, name: "Sarah", email: "sarah@example.com" },
  { id: 3, name: "Mike", email: "mike@example.com" },
];

users.forEach((user) => {
  console.log(greet(user));
});
`,
  python: `# Welcome to SyncIDE! 🚀
# Python - Start coding collaboratively

def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to the collaborative IDE."

users = ["Alex", "Sarah", "Mike"]

for user in users:
    print(greet(user))
`,
  cpp: `// Welcome to SyncIDE! 🚀
// C++ - Start coding collaboratively

#include <iostream>
#include <vector>
#include <string>

std::string greet(const std::string& name) {
  return "Hello, " + name + "! Welcome to the collaborative IDE.";
}

int main() {
  std::vector<std::string> users = {"Alex", "Sarah", "Mike"};

  for (const auto& user : users) {
    std::cout << greet(user) << std::endl;
  }

  return 0;
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SyncIDE - Collaborative Coding</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      color: #e5e7eb;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      color: #10b981;
      font-size: 3rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to SyncIDE! 🚀</h1>
    <p>Start coding collaboratively in real-time.</p>
  </div>
</body>
</html>
`,
  css: `/* Welcome to SyncIDE! 🚀 */
/* CSS - Style your collaborative project */

:root {
  --primary: #10b981;
  --secondary: #06b6d4;
  --background: #0a0a0a;
  --text: #e5e7eb;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--background);
  color: var(--text);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.button {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}
`,
  json: `{
  "name": "syncide-project",
  "version": "1.0.0",
  "description": "Welcome to SyncIDE! 🚀 - A collaborative coding project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "npm run compile",
    "test": "jest"
  },
  "keywords": [
    "collaborative",
    "real-time",
    "coding",
    "syncide"
  ],
  "author": "SyncIDE Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.5.0"
  }
}
`
};

export default function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [code, setCode] = useState(boilerplates.javascript);
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState("main.js");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState(mockMessages);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState("explorer");
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  // Video call state
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoPanelOpen, setIsVideoPanelOpen] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  // Get username from localStorage (set by JoinRoomModal)
  const [userName, setUserName] = useState(() => localStorage.getItem("syncide-username") || "");
  const [showJoinModal, setShowJoinModal] = useState(!userName);
  
  const saveTimeout = useRef(null);

  // Media Stream Hook - handles camera, mic, and screen sharing
  const {
    localStream,
    screenStream,
    localVideoRef,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    stopAll,
  } = useMediaStream();

  // WebRTC Hook - handles peer connections and remote streams
  const {
    remoteStreams,
    peerStatuses,
    joinCall,
    leaveCall,
    cleanup: cleanupWebRTC,
  } = useWebRTC({ socket, roomId, userName, localStream });
  


  // Auto-start video call when user joins room - DISABLED, now triggered by backend
  // useEffect(() => {
  //   console.log('[EditorPage] Auto-join effect triggered, userName:', userName, 'isInCall:', isInCall);
  //   ...
  // }, [userName]);

  // Cleanup on page unload/reload - NO AUTO RESTART
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      console.log('[EditorPage] Page unloading, cleaning up...');
      if (isInCall) {
        stopAll();
        socket.emit("leave-video-call", { roomId, userName });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isInCall, stopAll, roomId, userName]);

  // Broadcast media status whenever it changes - DON'T leave call on camera off
  useEffect(() => {
    if (!socket || !roomId || !isInCall) return;
    
    console.log(`[EditorPage] Broadcasting media status: mic=${isMicOn}, camera=${isCameraOn}`);
    socket.emit("media-status-changed", { 
      roomId, 
      isMicOn, 
      isCameraOn 
    });
    
    // DON'T leave call when camera/mic is off - just broadcast status
  }, [isMicOn, isCameraOn, isInCall, roomId]);

  // Save handler
  const handleSave = useCallback(() => {
    setIsSyncing(true);
    socket.emit("code-change", { roomId, code });
    setTimeout(() => setIsSyncing(false), 500);
  }, [roomId, code]);

  // Keyboard shortcut - Ctrl+S to save
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Run handler
  useEffect(() => {
    if (!userName) return;
    
    console.log('[EditorPage] Setting up socket listeners for room:', roomId);
    socket.emit("join-room", roomId, userName);

    socket.on("code-update", (newCode) => {
      setCode(newCode);
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 500);
    });

    socket.on("room-users", (userList) => {
      console.log('[EditorPage] Received room-users:', userList);
      setUsers(userList);
    });

    socket.on("connect", () => {
      console.log('[EditorPage] Socket connected');
      setIsConnected(true);
    });
    
    socket.on("disconnect", () => {
      console.log('[EditorPage] Socket disconnected');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.off("code-update");
      socket.off("room-users");
      socket.off("connect");
      socket.off("disconnect");
      
      // Clean up video call if active
      if (isInCall) {
        console.log('[EditorPage] Cleaning up on unmount');
        leaveCall();
        stopAll();
        cleanupWebRTC();
      }
      
      // Leave room
      socket.emit("leave-room", roomId);
    };
  }, [roomId, userName]);

  // Show join modal if username is missing
  const handleJoinModalClose = (name) => {
    if (name && name.trim()) {
      localStorage.setItem("syncide-username", name);
      setUserName(name);
      setShowJoinModal(false);
    }
  };

  // Code change handler
  const handleCodeChange = useCallback((value) => {
    if (!value) return;

    setCode(value);
    setIsSyncing(true);

    // Real-time sync and save
    socket.emit("code-change", {
      roomId,
      code: value,
    });
    setIsSyncing(false);
  }, [roomId]);

  // Language change handler
  const handleLanguageChange = useCallback((lang) => {
    const extensions = {
      javascript: "main.js",
      typescript: "main.ts",
      python: "main.py",
      java: "Main.java",
      cpp: "main.cpp",
      html: "index.html",
      css: "styles.css",
      json: "data.json",
    };
    
    setLanguage(lang);
    setFileName(extensions[lang] || "untitled");
    
    // Only set boilerplate if the editor is empty or still has the default JS boilerplate.
    // NEVER overwrite code that collaborators have written.
    const currentCode = code.trim();
    const isEmptyOrDefault =
      !currentCode ||
      currentCode === boilerplates["javascript"].trim() ||
      currentCode === boilerplates[language]?.trim();

    if (isEmptyOrDefault && boilerplates[lang]) {
      setCode(boilerplates[lang]);
      socket.emit("code-change", { roomId, code: boilerplates[lang] });
    }
  }, [code, language, roomId]);

  // Socket connection
  const handleRun = useCallback(() => {
    setIsTerminalOpen(true);
    // Add run logic here
  }, []);

  // Leave room handler
  const handleLeaveRoom = useCallback(() => {
    socket.emit("leave-room", roomId);
    navigate("/");
  }, [roomId, navigate]);

  // Send message handler
  const handleSendMessage = useCallback((text) => {
    const newMessage = {
      user: "You",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, newMessage]);
    socket.emit("chat-message", { roomId, message: newMessage });
  }, [roomId]);

  // Cursor change handler
  const handleCursorChange = useCallback((position) => {
    setCursorPosition(position);
    socket.emit("cursor-move", { roomId, position });
  }, [roomId]);

  // Video call handlers
  const handleToggleVideoCall = useCallback(() => {
    if (isInCall) {
      setShowVideoCall(true);
    }
  }, [isInCall]);

  const handleEndCall = useCallback(() => {
    console.log('[EditorPage] Ending call - user clicked Leave button');
    
    // Stop all media first
    stopAll();
    
    // Leave WebRTC call
    leaveCall();
    cleanupWebRTC();
    
    // Update state
    setIsInCall(false);
    setShowVideoCall(false);
    
    // Notify server
    socket.emit("leave-video-call", { roomId, userName });
    
    console.log('[EditorPage] Call ended successfully');
  }, [roomId, userName, leaveCall, cleanupWebRTC, stopAll]);

  const handleStartCall = useCallback(async () => {
    if (isInCall) {
      console.log('[EditorPage] Already in call');
      return;
    }
    
    try {
      console.log('[EditorPage] Starting call manually...');
      
      // First join the WebRTC call (without media)
      console.log('[EditorPage] Joining WebRTC call...');
      joinCall();
      setIsInCall(true);
      setIsVideoPanelOpen(true);
      
      // Then turn on camera
      console.log('[EditorPage] Turning on camera...');
      await toggleCamera();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Then turn on mic
      console.log('[EditorPage] Turning on mic...');
      await toggleMic();
      
      console.log('[EditorPage] Call started successfully');
    } catch (error) {
      console.error('[EditorPage] Failed to start call:', error);
    }
  }, [isInCall, joinCall, toggleCamera, toggleMic]);

  if (showJoinModal) {
    return <JoinRoomModal open={true} onClose={handleJoinModalClose} roomId={roomId} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#030303] overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Ambient glow */}
        <div 
          className="absolute top-0 left-1/4 w-150 h-100 opacity-20"
          style={{
            background: "radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 50%)",
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-125 h-75 opacity-15"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Top Bar */}
      <TopBar
        roomId={roomId}
        users={users}
        onLeaveRoom={handleLeaveRoom}
        onSave={handleSave}
        onRun={handleRun}
        language={language.charAt(0).toUpperCase() + language.slice(1)}
        onLanguageChange={handleLanguageChange}
        fileName={fileName}
        isInCall={isInCall}
        onToggleVideoCall={handleToggleVideoCall}
        user={user}
      />
      

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeSidebarTab}
          onTabChange={setActiveSidebarTab}
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Monaco Editor */}
            <EditorPane
              code={code}
              onCodeChange={handleCodeChange}
              language={language}
              onCursorChange={handleCursorChange}
            />

            {/* Right Panel - Users/Chat */}
            <AnimatePresence>
              <div className="hidden md:flex">
                <RightPanel
                  users={users}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isCollapsed={isRightPanelCollapsed}
                  onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                />
              </div>
            </AnimatePresence>

            {/* Video Side Panel */}
            <div className="hidden md:flex">
              <VideoSidePanel
                isOpen={isVideoPanelOpen}
                onToggle={() => setIsVideoPanelOpen(!isVideoPanelOpen)}
                localStream={localStream}
                remoteStreams={remoteStreams}
                peerStatuses={peerStatuses}
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                isScreenSharing={isScreenSharing}
                onToggleCamera={toggleCamera}
                onToggleMic={toggleMic}
                onStartScreenShare={toggleScreenShare}
                onStopScreenShare={toggleScreenShare}
                onStartCall={handleStartCall}
                onEndCall={handleEndCall}
                onOpenFullscreen={() => setShowVideoCall(true)}
                isInCall={isInCall}
                users={users}
                userName={userName}
              />
            </div>
          </div>

          {/* Terminal */}
          <Terminal
            isOpen={isTerminalOpen}
            onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        language={language.charAt(0).toUpperCase() + language.slice(1)}
        line={cursorPosition.line}
        column={cursorPosition.column}
        connected={isConnected}
        syncing={isSyncing}
        errors={0}
        warnings={0}
        branch="main"
      />

      {/* Mobile Right Panel Toggle */}
      <motion.button
        className="fixed bottom-20 right-4 md:hidden w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 backdrop-blur-sm z-50"
        onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </motion.button>

      {/* Mobile Panel Overlay */}
      <AnimatePresence>
        {!isRightPanelCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-y-0 right-0 w-80 md:hidden z-50"
          >
            <RightPanel
              users={users}
              messages={messages}
              onSendMessage={handleSendMessage}
              isCollapsed={false}
              onToggleCollapse={() => setIsRightPanelCollapsed(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {!isRightPanelCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 md:hidden z-40"
            onClick={() => setIsRightPanelCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Full Screen Video Call */}
      <AnimatePresence>
        <VideoCall
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          localStream={localStream}
          screenStream={screenStream}
          remoteStreams={remoteStreams}
          isCameraOn={isCameraOn}
          isMicOn={isMicOn}
          isScreenSharing={isScreenSharing}
          onToggleCamera={toggleCamera}
          onToggleMic={toggleMic}
          onStartScreenShare={toggleScreenShare}
          onStopScreenShare={toggleScreenShare}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          users={users}
          userName={userName}
        />
      </AnimatePresence>
    </div>
  );
}
