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
    {/* Animated lock */}
    <motion.svg
      className="absolute top-20 right-[10%] w-20 h-20 opacity-[0.03]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="0.5"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </motion.svg>

    {/* Animated shield */}
    <motion.svg
      className="absolute bottom-24 left-[8%] w-16 h-16 opacity-[0.04]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#10b981"
      strokeWidth="0.8"
      animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.06, 0.04] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </motion.svg>

    {/* Network nodes */}
    <motion.svg
      className="absolute top-1/2 left-[5%] w-24 h-24 opacity-[0.03]"
      viewBox="0 0 100 100"
    >
      <motion.circle cx="20" cy="50" r="4" fill="white"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle cx="50" cy="20" r="4" fill="white"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle cx="80" cy="50" r="4" fill="white"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      />
      <motion.circle cx="50" cy="80" r="4" fill="white"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
      />
      <motion.circle cx="50" cy="50" r="6" fill="#10b981"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <line x1="20" y1="50" x2="44" y2="50" stroke="white" strokeWidth="0.5" />
      <line x1="56" y1="50" x2="80" y2="50" stroke="white" strokeWidth="0.5" />
      <line x1="50" y1="20" x2="50" y2="44" stroke="white" strokeWidth="0.5" />
      <line x1="50" y1="56" x2="50" y2="80" stroke="white" strokeWidth="0.5" />
    </motion.svg>

    {/* Hexagon pattern */}
    <motion.svg
      className="absolute bottom-20 right-[15%] w-16 h-16 opacity-[0.03]"
      viewBox="0 0 100 100"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
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
