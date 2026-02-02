import { motion } from "framer-motion";

const stacks = [
  { name: "JavaScript", color: "#f7df1e" },
  { name: "React", color: "#61dafb" },
  { name: "Node.js", color: "#68a063" },
  { name: "MongoDB", color: "#4db33d" },
  { name: "Socket.IO", color: "#ffffff" },
];

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="relative py-24 px-6 bg-[#030303]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Explore the Ecosystem
          </h2>
          <p className="text-neutral-500 max-w-md mx-auto">
            Built with modern, battle-tested technologies
          </p>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {stacks.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -3 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-default"
            >
              <motion.span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: s.color }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
              <span className="text-sm text-neutral-300">{s.name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="max-w-md mx-auto p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] transition-colors"
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div 
              className="w-2.5 h-2.5 rounded-full bg-red-500/60"
              whileHover={{ scale: 1.3 }}
            />
            <motion.div 
              className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"
              whileHover={{ scale: 1.3 }}
            />
            <motion.div 
              className="w-2.5 h-2.5 rounded-full bg-green-500/60"
              whileHover={{ scale: 1.3 }}
            />
            <span className="ml-2 text-xs text-neutral-600">package.json</span>
          </div>
          <pre className="text-xs text-neutral-500 font-mono leading-relaxed">
{`{
  "dependencies": {
    "react": "^18.2.0",
    "socket.io-client": "^4.7.0",
    "framer-motion": "^11.0.0"
  }
}`}
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
