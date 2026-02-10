import { motion } from "framer-motion";

// Animated SVG Icons
const PulseIcon = () => (
  <motion.svg 
    className="w-5 h-5 text-emerald-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <motion.path
      d="M22 12h-4l-3 9L9 3l-3 9H2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.svg>
);

const ServerIcon = () => (
  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7" />
  </svg>
);

const metricIcons = {
  "Active Rooms": (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
    </svg>
  ),
  "Users Online": (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  "Sync Latency": (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  "Uptime": (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const statIcons = [
  <svg key="data" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </svg>,
  <svg key="speed" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  <svg key="sessions" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>,
];

export default function LiveSignal() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-[#030303]">
      {/* Subtle gradient */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Animated Background SVG Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <motion.svg
          className="absolute top-10 left-10 w-32 h-32"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="10 5" />
        </motion.svg>
        <motion.svg
          className="absolute bottom-20 right-20 w-24 h-24"
          viewBox="0 0 100 100"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" stroke="white" strokeWidth="0.5" fill="none" />
        </motion.svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <PulseIcon />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              System Status
            </h2>
          </div>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Real-time metrics across all active sessions
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-8"
        >
          {/* Status Bar */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-white">All Systems Operational</span>
              <ServerIcon />
            </div>
            <span className="text-xs text-neutral-600">Updated 2s ago</span>
          </div>

          {/* Metrics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric label="Active Rooms" value="24+" delay={0.15} icon={metricIcons["Active Rooms"]} />
            <Metric label="Users Online" value="78" delay={0.2} icon={metricIcons["Users Online"]} />
            <Metric label="Sync Latency" value="<45ms" delay={0.25} icon={metricIcons["Sync Latency"]} />
            <Metric label="Uptime" value="99.9%" delay={0.3} icon={metricIcons["Uptime"]} />
          </div>

          {/* Simple Activity Bar */}
          <div className="mt-8 pt-6 border-t border-white/[0.04]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-neutral-500">Server Load</span>
              <span className="text-xs text-neutral-400">32%</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "32%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 grid grid-cols-3 gap-4"
        >
          {[
            { value: "2.4TB", label: "Data Synced" },
            { value: "12ms", label: "Avg Response" },
            { value: "1,247", label: "Sessions Today" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              className="text-center py-4 px-6 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
            >
              <div className="flex items-center justify-center gap-2 mb-1 text-emerald-400/60">
                {statIcons[i]}
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Metric({ label, value, delay = 0, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.1)" }}
      className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] transition-colors cursor-default"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-emerald-400/60">{icon}</span>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-emerald-400">{value}</p>
    </motion.div>
  );
}
