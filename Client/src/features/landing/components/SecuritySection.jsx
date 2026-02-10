import { motion } from "framer-motion";

// Animated security icons
const AnimatedShieldIcon = () => (
  <motion.svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <motion.path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  </motion.svg>
);

const AnimatedServerIcon = () => (
  <motion.svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <motion.path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
    />
  </motion.svg>
);

const AnimatedScaleIcon = () => (
  <motion.svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <motion.path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
    />
  </motion.svg>
);

const features = [
  {
    title: "Room-Level Isolation",
    desc: "Complete data separation between workspaces with no cross-room leakage.",
    icon: <AnimatedShieldIcon />,
  },
  {
    title: "Server-Side Validation",
    desc: "All events verified at backend layer before propagation.",
    icon: <AnimatedServerIcon />,
  },
  {
    title: "Future-Ready",
    desc: "Architecture designed for horizontal scaling and growth.",
    icon: <AnimatedScaleIcon />,
  },
];

// Animated lock decoration
const SecurityDecoration = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Rotating lock ring */}
    <motion.div
      className="absolute top-20 right-[10%] w-24 h-24"
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
    >
      <svg className="w-full h-full opacity-[0.04]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="#10b981" strokeWidth="1" strokeDasharray="10 5" fill="none" />
        <circle cx="50" cy="50" r="35" stroke="#10b981" strokeWidth="0.5" fill="none" />
      </svg>
      <motion.div
        className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/50"
      />
    </motion.div>

    {/* Floating lock icon inside */}
    <motion.svg
      className="absolute top-24 right-[11%] w-12 h-12 opacity-[0.04]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="0.5"
      animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </motion.svg>

    {/* Rotating shield with orbiting particles */}
    <motion.div
      className="absolute bottom-28 left-[8%] w-20 h-20"
      animate={{ rotate: -360 }}
      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
    >
      <svg className="w-full h-full opacity-[0.04]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#8b5cf6" strokeWidth="1" fill="none" />
      </svg>
      <div className="absolute top-1/2 left-0 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-purple-400/60" />
      <div className="absolute top-1/2 right-0 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-purple-400/40" />
    </motion.div>

    {/* Animated shield inside rotating ring */}
    <motion.svg
      className="absolute bottom-32 left-[10%] w-10 h-10 opacity-[0.05]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#10b981"
      strokeWidth="0.8"
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </motion.svg>

    {/* Rotating network nodes */}
    <motion.div
      className="absolute top-1/2 left-[5%] w-24 h-24"
      animate={{ rotate: 360 }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
    >
      <svg className="w-full h-full opacity-[0.03]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" strokeDasharray="3 5" fill="none" />
        <circle cx="50" cy="10" r="4" fill="#10b981" />
        <circle cx="90" cy="50" r="4" fill="#10b981" />
        <circle cx="50" cy="90" r="4" fill="#10b981" />
        <circle cx="10" cy="50" r="4" fill="#10b981" />
      </svg>
    </motion.div>

    {/* Central pulsing node */}
    <motion.div
      className="absolute top-1/2 left-[5%] w-24 h-24 flex items-center justify-center"
    >
      <motion.div
        className="w-3 h-3 rounded-full bg-emerald-500/20"
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>

    {/* Spinning hexagon security badge */}
    <motion.svg
      className="absolute top-1/3 right-[5%] w-16 h-16 opacity-[0.03]"
      viewBox="0 0 100 100"
      animate={{ rotate: 360 }}
      transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
    >
      <polygon 
        points="50,5 93,25 93,75 50,95 7,75 7,25" 
        stroke="#10b981" 
        strokeWidth="1" 
        fill="none" 
      />
      <polygon 
        points="50,20 78,35 78,65 50,80 22,65 22,35" 
        stroke="#10b981" 
        strokeWidth="0.5" 
        strokeDasharray="5 3"
        fill="none" 
      />
    </motion.svg>

    {/* Rotating bottom hexagon */}
    <motion.svg
      className="absolute bottom-20 right-[15%] w-16 h-16 opacity-[0.03]"
      viewBox="0 0 100 100"
      animate={{ rotate: -360 }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
    >
      <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" stroke="white" strokeWidth="1" fill="none" />
    </motion.svg>
  </div>
);

export default function SecuritySection() {
  return (
    <section id="security" className="relative py-24 px-6 bg-[#030303]">
      <SecurityDecoration />
      
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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </motion.svg>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Secured & Built to Scale
            </h2>
          </div>
          <p className="text-neutral-500 max-w-md mx-auto">
            Enterprise-grade security with modern architecture
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4"
                whileHover={{ scale: 1.15, rotate: 10 }}
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
