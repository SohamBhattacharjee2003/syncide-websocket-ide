import { motion } from "framer-motion";

// Animated SVG Icons with path animations
const AnimatedEditIcon = () => (
  <motion.svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <motion.path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  </motion.svg>
);

const AnimatedLockIcon = () => (
  <motion.svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <motion.path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
    />
  </motion.svg>
);

const AnimatedDatabaseIcon = () => (
  <motion.svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <motion.path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
    />
  </motion.svg>
);

const AnimatedBoltIcon = () => (
  <motion.svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <motion.path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 10V3L4 14h7v7l9-11h-7z"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
    />
  </motion.svg>
);

const features = [
  {
    title: "Live Editing",
    desc: "Multiple developers edit the same codebase simultaneously with instant sync.",
    icon: <AnimatedEditIcon />,
  },
  {
    title: "Room Isolation",
    desc: "Each workspace remains private with complete session isolation.",
    icon: <AnimatedLockIcon />,
  },
  {
    title: "Auto Persistence",
    desc: "Code is automatically saved and restored across sessions.",
    icon: <AnimatedDatabaseIcon />,
  },
  {
    title: "Low Latency",
    desc: "Optimized WebSocket pipeline for instant synchronization.",
    icon: <AnimatedBoltIcon />,
  },
];

// Decorative animated background elements
const BackgroundShapes = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Rotating hexagon */}
    <motion.svg
      className="absolute top-20 left-[10%] w-16 h-16 opacity-[0.04]"
      viewBox="0 0 100 100"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      <polygon 
        points="50,5 93,25 93,75 50,95 7,75 7,25" 
        stroke="url(#hexFeatureGrad)" 
        strokeWidth="1" 
        fill="none" 
      />
      <defs>
        <linearGradient id="hexFeatureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </motion.svg>

    {/* Rotating ring with orbiting dot */}
    <motion.div
      className="absolute top-32 right-[8%] w-32 h-32"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg className="w-full h-full opacity-[0.05]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="#10b981" strokeWidth="1" fill="none" />
        <circle cx="50" cy="50" r="35" stroke="#10b981" strokeWidth="0.5" strokeDasharray="5 5" fill="none" />
      </svg>
      <motion.div
        className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-emerald-400/50"
      />
    </motion.div>

    {/* Counter-rotating inner ring */}
    <motion.div
      className="absolute bottom-40 left-[12%] w-24 h-24"
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    >
      <svg className="w-full h-full opacity-[0.05]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="8 4" fill="none" />
      </svg>
      <motion.div
        className="absolute top-1/2 right-0 w-1.5 h-1.5 translate-x-1/2 rounded-full bg-purple-400/60"
      />
    </motion.div>

    {/* Animated circles - scaling and rotating */}
    <motion.svg
      className="absolute bottom-32 right-[15%] w-20 h-20 opacity-[0.04]"
      viewBox="0 0 100 100"
      animate={{ rotate: 360, scale: [1, 1.1, 1] }}
      transition={{ rotate: { duration: 40, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
    >
      <circle cx="50" cy="50" r="45" stroke="#10b981" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="30" stroke="#10b981" strokeWidth="0.5" fill="none" />
    </motion.svg>

    {/* Rotating code brackets */}
    <motion.svg
      className="absolute top-1/2 right-[5%] w-12 h-24 opacity-[0.05]"
      viewBox="0 0 40 80"
      animate={{ rotate: [0, 10, 0], x: [0, 5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M10 10 L30 40 L10 70" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
    </motion.svg>

    <motion.svg
      className="absolute top-1/3 left-[5%] w-12 h-24 opacity-[0.05]"
      viewBox="0 0 40 80"
      animate={{ rotate: [0, -10, 0], x: [0, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    >
      <path d="M30 10 L10 40 L30 70" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
    </motion.svg>

    {/* Rotating diamond */}
    <motion.div
      className="absolute top-[60%] right-[25%] w-10 h-10 opacity-[0.04]"
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      <div className="w-full h-full rotate-45 border border-emerald-400 rounded-sm" />
    </motion.div>

    {/* Orbiting particles system */}
    <div className="absolute bottom-[30%] left-[30%] w-16 h-16">
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 w-1 h-1 -translate-x-1/2 rounded-full bg-emerald-400/30" />
        <div className="absolute bottom-0 left-1/2 w-1 h-1 -translate-x-1/2 rounded-full bg-cyan-400/30" />
      </motion.div>
    </div>

    {/* Grid dots with rotation */}
    <motion.div 
      className="absolute bottom-20 left-[20%] opacity-[0.06]"
      animate={{ rotate: [0, 5, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="grid grid-cols-3 gap-3">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-6 bg-[#030303]">
      {/* Background */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.1) 0%, transparent 60%)",
        }}
      />

      <BackgroundShapes />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.svg 
              className="w-6 h-6 text-emerald-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </motion.svg>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Built for Real Collaboration
            </h2>
          </div>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Everything you need to code together, seamlessly
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {f.icon}
              </motion.div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
