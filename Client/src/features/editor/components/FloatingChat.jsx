import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatIcon, CloseIcon } from "../../../shared/components/ui/Icons";

/**
 * FloatingChat — real-time chat powered by Socket.IO.
 *
 * Props:
 *  - isOpen, onToggle
 *  - socket       (socket.io client)
 *  - roomId       (string)
 *  - userName     (string - local user display name)
 *  - participants (array  - for online count / avatars)
 *  - onUnreadChange (function - called with unread count)
 */
export default function FloatingChat({
  isOpen,
  onToggle,
  socket,
  roomId,
  userName,
  participants = [],
  onUnreadChange,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);

  // Colors by sender name hash
  const senderColor = (name) => {
    const colors = ["#10b981", "#8b5cf6", "#f59e0b", "#3b82f6", "#ec4899", "#06b6d4"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // Listen for incoming chat messages
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpen) {
        setUnread((prev) => {
          const next = prev + 1;
          onUnreadChange?.(next);
          return next;
        });
      }
    };
    socket.on("chat-message", handler);
    return () => socket.off("chat-message", handler);
  }, [socket, isOpen, onUnreadChange]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear unread when opened
  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      onUnreadChange?.(0);
    }
  }, [isOpen, onUnreadChange]);

  // Send message
  const sendMessage = () => {
    const text = input.trim();
    if (!text || !socket || !roomId) return;

    const msg = {
      id: Date.now().toString(),
      sender: userName || "Anonymous",
      text,
      timestamp: new Date().toISOString(),
    };

    // Show locally immediately
    setMessages((prev) => [...prev, msg]);
    // Send to others via socket
    socket.emit("chat-message", { roomId, message: msg });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const onlineCount = participants.length || 1;

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[380px] h-[480px] bg-[#111114] border border-[#2a2a32] rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#0d0d0f] border-b border-[#2a2a32] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d0d0f]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Team Chat</h3>
                  <p className="text-gray-500 text-xs">{onlineCount} member{onlineCount !== 1 ? "s" : ""} online</p>
                </div>
              </div>
              <button onClick={onToggle} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1e1e24] transition-all">
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                  <svg className="w-10 h-10 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                  <span className="text-sm">No messages yet</span>
                  <span className="text-xs text-neutral-600">Say hi to your team!</span>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender === userName;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {!isMe && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: senderColor(msg.sender) }}
                      >
                        {msg.sender.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? "items-end" : ""}`}>
                      {!isMe && (
                        <span className="text-[11px] font-medium mb-0.5 block" style={{ color: senderColor(msg.sender) }}>
                          {msg.sender}
                        </span>
                      )}
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-emerald-600/90 text-white rounded-br-md"
                            : "bg-[#1e1e24] text-gray-200 rounded-tl-md"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-600 mt-1 block">{formatTime(msg.timestamp)}</span>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#0d0d0f] border-t border-[#2a2a32]">
              <div className="flex gap-2 items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                <motion.button
                  onClick={sendMessage}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen
            ? "bg-[#1e1e24] text-gray-400"
            : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/30"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <CloseIcon />
        ) : (
          <>
            <ChatIcon />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </motion.button>
    </div>
  );
}
