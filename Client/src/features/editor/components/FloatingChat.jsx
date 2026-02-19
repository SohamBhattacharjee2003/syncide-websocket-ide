import { motion, AnimatePresence } from 'framer-motion';
import { ChatIcon, CloseIcon } from '../../../shared/components/ui/Icons';

// Floating Chat Component
export default function FloatingChat({ isOpen, onToggle }) {
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
            {/* Chat Header */}
            <div className="px-4 py-3 bg-[#0d0d0f] border-b border-[#2a2a32] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d0d0f]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Team Chat</h3>
                  <p className="text-gray-500 text-xs">3 members online</p>
                </div>
              </div>
              <button 
                onClick={onToggle}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1e1e24] transition-all"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Online Users Bar */}
            <div className="px-4 py-2 bg-[#0a0a0c] border-b border-[#2a2a32] flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0a0a0c] flex items-center justify-center text-white text-[8px] font-bold">Y</div>
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#0a0a0c] flex items-center justify-center text-white text-[8px] font-bold">EW</div>
                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-[#0a0a0c] flex items-center justify-center text-white text-[8px] font-bold">JC</div>
              </div>
              <span className="text-[10px] text-gray-500">Emma is typing...</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Date Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-[#2a2a32]" />
                <span className="text-[10px] text-gray-600 font-medium">Today</span>
                <div className="flex-1 h-px bg-[#2a2a32]" />
              </div>

              {/* No messages yet. In production, messages will appear here. */}
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <span>No messages yet.</span>
              </div>

              {/* Typing Indicator */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  EW
                </div>
                <div className="bg-[#1e1e24] px-4 py-3 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1.5">
                    <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                    <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0d0d0f] border-t border-[#2a2a32]">
              <div className="flex gap-3 items-center">
                <button className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-[#1e1e24] transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/>
                  </svg>
                </button>
                <input 
                  placeholder="Type a message..." 
                  className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all" 
                />
                <motion.button 
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        onClick={onToggle}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen 
            ? 'bg-[#1e1e24] text-gray-400' 
            : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/30'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <CloseIcon />
        ) : (
          <>
            <ChatIcon />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}
