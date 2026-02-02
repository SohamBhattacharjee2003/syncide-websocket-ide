import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 lg:px-12 py-24 overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[#030303]" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* AMBIENT GLOW - CENTER TOP */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] opacity-60 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(16,185,129,0.15) 0%, transparent 50%)",
        }}
      />

      {/* Glow behind editor - Right */}
      <div 
        className="absolute top-[20%] right-[5%] w-[700px] h-[600px] opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 50%)",
        }}
      />

      {/* Purple accent glow - Left */}
      <div 
        className="absolute top-[40%] left-[0%] w-[500px] h-[500px] opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 50%)",
        }}
      />

      {/* Animated Floating Orbs */}
      <motion.div
        className="absolute top-[15%] left-[15%] w-2 h-2 rounded-full bg-emerald-400/60 blur-[2px] hidden lg:block"
        animate={{ y: [0, -30, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[25%] right-[20%] w-3 h-3 rounded-full bg-purple-400/40 blur-[3px] hidden lg:block"
        animate={{ y: [0, 25, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[30%] left-[10%] w-2 h-2 rounded-full bg-cyan-400/50 blur-[2px] hidden lg:block"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Floating Code Brackets - Left */}
      <motion.svg
        className="absolute left-[5%] top-[25%] opacity-25 pointer-events-none hidden lg:block"
        width="50" height="100" viewBox="0 0 40 80"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M30 10 L10 40 L30 70" stroke="url(#bracketGradL)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <defs>
          <linearGradient id="bracketGradL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Floating Code Brackets - Right */}
      <motion.svg
        className="absolute right-[5%] top-[20%] opacity-25 pointer-events-none hidden lg:block"
        width="50" height="100" viewBox="0 0 40 80"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <path d="M10 10 L30 40 L10 70" stroke="url(#bracketGradR)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <defs>
          <linearGradient id="bracketGradR" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Decorative code symbols */}
      <motion.div
        className="absolute left-[8%] top-[60%] text-emerald-500/20 font-mono text-2xl hidden xl:block"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {"</>"}
      </motion.div>
      <motion.div
        className="absolute right-[8%] bottom-[25%] text-purple-500/20 font-mono text-xl hidden xl:block"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      >
        {"{ }"}
      </motion.div>

      {/* Small decorative dots - Left */}
      <div className="absolute left-[3%] top-[50%] pointer-events-none opacity-30 hidden xl:block">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Small decorative dots - Right */}
      <div className="absolute right-[3%] top-[60%] pointer-events-none opacity-30 hidden xl:block">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* LEFT - TEXT CONTENT */}
        <div className="flex-1 text-center lg:text-left max-w-2xl">
          
          {/* ANNOUNCEMENT BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <a 
              href="#features" 
              className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/[0.1] hover:border-emerald-500/30 hover:from-emerald-500/10 hover:to-transparent transition-all duration-500 backdrop-blur-sm"
            >
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-full">
                <motion.span 
                  className="w-1.5 h-1.5 rounded-full bg-black/30"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                New
              </span>
              <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">Live cursors available</span>
              <motion.svg 
                className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </a>
          </motion.div>

          {/* MAIN HEADLINE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]"
          >
            Code together,
            <br />
            <span className="text-emerald-400">ship faster</span>
          </motion.h1>

          {/* SUBHEADLINE */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 text-base sm:text-lg text-neutral-500 max-w-md mx-auto lg:mx-0 leading-relaxed"
          >
            Real-time collaborative code editor that keeps your team in sync. 
            No setup required — just create a room and start coding.
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
          >
            <button
              onClick={() => navigate("/editor")}
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold text-base transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:scale-[1.02] overflow-hidden"
            >
              {/* Shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                Start coding free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            <button className="group px-8 py-4 rounded-xl text-neutral-300 hover:text-white text-base font-medium border border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 flex items-center gap-2.5 backdrop-blur-sm">
              <div className="relative">
                <svg className="w-5 h-5 text-neutral-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="absolute inset-0 rounded-full bg-emerald-400/20 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
              Watch demo
            </button>
          </motion.div>

          {/* SOCIAL PROOF */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-14 flex items-center justify-center lg:justify-start gap-8"
          >
            <span className="text-xs text-neutral-600 uppercase tracking-[0.2em]">Trusted by</span>
            <div className="flex items-center gap-6">
              {["Google", "Meta", "Stripe", "Vercel"].map((company, i) => (
                <motion.span 
                  key={company} 
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-300 transition-colors cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  {company}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT - EDITOR PREVIEW */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex-1 w-full max-w-xl lg:max-w-2xl perspective-1000"
        >
          {/* Animated border gradient */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-emerald-500/50 via-transparent to-purple-500/50 overflow-hidden">
            {/* Rotating border animation */}
            <motion.div
              className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,#10b981,transparent,#8b5cf6,transparent)] opacity-50"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ filter: "blur(15px)" }}
            />
            
            <div className="relative rounded-2xl overflow-hidden bg-[#0a0a0a] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9)]">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-gradient-to-r from-[#0c0c0c] to-[#0f0f0f]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.4)]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.4)]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.4)]" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 ml-4">
                    <div className="px-3 py-1.5 rounded-lg text-xs text-white bg-white/[0.08] border-b-2 border-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
                      main.js
                    </div>
                    <div className="px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:text-neutral-400 hover:bg-white/[0.03] cursor-pointer transition-all">
                      utils.js
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <motion.div 
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-[#0c0c0c] flex items-center justify-center text-[10px] text-white font-medium shadow-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >S</motion.div>
                    <motion.div 
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-[#0c0c0c] flex items-center justify-center text-[10px] text-white font-medium shadow-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >M</motion.div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs text-emerald-400 font-semibold">Live</span>
                  </div>
                </div>
              </div>
              
              {/* Code area */}
              <div className="p-6 font-mono text-sm leading-7 overflow-hidden bg-gradient-to-b from-transparent to-black/20">
                <div className="flex gap-6">
                  <div className="text-neutral-600 text-right select-none w-5">
                    {[1,2,3,4,5,6,7,8,9,10,11].map(n => <div key={n}>{n}</div>)}
                  </div>
                  <div className="flex-1 relative">
                    <div><span className="text-purple-400">import</span> <span className="text-emerald-300">{"{ useSync, useCursor }"}</span> <span className="text-purple-400">from</span> <span className="text-amber-300">'@syncide/core'</span><span className="text-neutral-500">;</span></div>
                    <div><span className="text-purple-400">import</span> <span className="text-emerald-300">{"{ Editor }"}</span> <span className="text-purple-400">from</span> <span className="text-amber-300">'@syncide/react'</span><span className="text-neutral-500">;</span></div>
                    <div className="text-neutral-700">​</div>
                    <div><span className="text-purple-400">export default function</span> <span className="text-yellow-300">App</span><span className="text-neutral-400">() {"{"}</span></div>
                    <div><span className="text-neutral-400">  </span><span className="text-purple-400">const</span> <span className="text-blue-300">{"{ doc, provider }"}</span> <span className="text-neutral-400">=</span> <span className="text-yellow-300">useSync</span><span className="text-neutral-400">({"{"}</span></div>
                    <div><span className="text-neutral-400">    roomId:</span> <span className="text-amber-300">'team-project'</span><span className="text-neutral-500">,</span></div>
                    <div><span className="text-neutral-400">  {"});"}</span></div>
                    <div className="text-neutral-700">​</div>
                    <div><span className="text-neutral-400">  </span><span className="text-purple-400">return</span> <span className="text-neutral-400">&lt;</span><span className="text-emerald-400">Editor</span> <span className="text-cyan-300">doc</span><span className="text-neutral-400">={"{"}</span><span className="text-blue-300">doc</span><span className="text-neutral-400">{"}"}</span> <span className="text-neutral-400">/&gt;;</span></div>
                    <div className="flex items-center">
                      <span className="text-neutral-400">{"}"}</span>
                      <motion.span
                        className="inline-block w-0.5 h-5 bg-emerald-400 ml-0.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    </div>
                    <div className="text-neutral-500">// Real-time sync ✨</div>
                    
                    {/* Collaborative Cursor - Sarah */}
                    <motion.div
                      className="absolute flex items-start gap-0.5 pointer-events-none"
                      style={{ top: '140px', left: '160px' }}
                      animate={{ x: [0, 50, 50, 0], y: [0, 0, 28, 28] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg className="w-4 h-4 text-cyan-400 -rotate-12 drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.94 2.35a.5.5 0 0 0-.44.86z"/>
                      </svg>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                        Sarah
                      </span>
                    </motion.div>

                    {/* Collaborative Cursor - Mike */}
                    <motion.div
                      className="absolute flex items-start gap-0.5 pointer-events-none"
                      style={{ top: '56px', left: '280px' }}
                      animate={{ x: [0, -30, -30, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    >
                      <svg className="w-4 h-4 text-purple-400 -rotate-12 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.94 2.35a.5.5 0 0 0-.44.86z"/>
                      </svg>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
                        Mike
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-[#080808] text-xs text-neutral-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-yellow-500/20 flex items-center justify-center text-[8px] text-yellow-500">JS</span>
                    JavaScript
                  </span>
                  <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Ln 10, Col 2</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-neutral-600 uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-neutral-700 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1 h-1.5 rounded-full bg-emerald-400"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
