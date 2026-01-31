import { motion } from "framer-motion";
import {
  FaGithub,
  FaDiscord,
  FaTwitter,
  FaBolt,
} from "react-icons/fa";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="relative bg-neutral-950 text-neutral-300 overflow-hidden">
      {/* Collaboration Flow Background */}
      <motion.div
        className="absolute top-0 left-0 w-72 h-72 bg-emerald-400 opacity-30 rounded-full blur-3xl"
        animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ zIndex: 0 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-3xl"
        animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ zIndex: 0 }}
      />

      {/* Ambient gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-16 border-b border-neutral-800 pb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-3">
              <motion.img
                src={logo}
                alt="SyncIDE Logo"
                className="w-12 h-11 rounded-full shadow-lg shadow-emerald-500/30 object-cover"
                animate={{
                  scale: [1, 1.03, 1],
                  rotate: [0, 1, 0],
                  boxShadow: [
                    "0 0 20px 0 rgba(16,185,129,0.12)",
                    "0 0 40px 0 rgba(16,185,129,0.24)",
                    "0 0 20px 0 rgba(16,185,129,0.12)"
                  ]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <h2 className="text-2xl font-semibold text-white">
                Sync<span className="text-emerald-400">IDE</span>
              </h2>
            </div>

            <p className="mt-6 max-w-md text-sm text-neutral-400 leading-relaxed">
              A real-time collaborative development environment built for teams
              that move fast, think deeply, and build together.
            </p>

            <div className="mt-6 flex items-center gap-4">
              {socials.map((s, i) => (
                <motion.a
                  key={i}
                  whileHover={{
                    scale: 1.15,
                    y: -4,
                    boxShadow: "0 0 40px rgba(42,242,179,0.15)",
                    color: "#2af2b3"
                  }}
                  whileTap={{ scale: 0.95 }}
                  href={s.href}
                  className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-emerald-400 hover:border-emerald-400 transition"
                  style={{ transition: "color 0.2s, box-shadow 0.2s, transform 0.2s" }}
                >
                  <s.icon style={{ transition: "transform 0.2s" }} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Columns */}
          {columns.map((col, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
            >
              <h4 className="text-sm font-semibold text-white tracking-wide">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((l, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                  >
                    <motion.a
                      href={l.href}
                      className="text-neutral-400 hover:text-emerald-400 transition rounded px-2 py-1"
                      whileHover={{
                        y: -2,
                        boxShadow: "0 0 20px rgba(42,242,179,0.10)",
                        color: "#2af2b3"
                      }}
                      style={{ display: "inline-block", transition: "color 0.2s, box-shadow 0.2s, transform 0.2s" }}
                    >
                      {l.label}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500"
        >
          <span>© 2026 SyncIDE. All rights reserved.</span>

          <span className="flex items-center gap-1">
            Built with <FaBolt className="text-emerald-400" /> by Soham
          </span>
        </motion.div>
      </div>
    </footer>
  );
}

/* ---------------- DATA ---------------- */

const socials = [
  { icon: FaDiscord, href: "#" },
  { icon: FaTwitter, href: "#" },
  { icon: FaGithub, href: "#" },
];

const columns = [
  {
    title: "Learn",
    links: [
      { label: "Docs", href: "#" },
      { label: "Features", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "Workspaces", href: "#" },
      { label: "Editor", href: "#" },
      { label: "API", href: "#" },
      { label: "Open Source", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
];
