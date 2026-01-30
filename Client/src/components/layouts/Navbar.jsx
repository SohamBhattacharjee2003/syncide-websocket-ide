import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur border-b border-neutral-800"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Sync<span className="text-emerald-400">IDE</span>
        </h1>

        <div className="flex gap-4">
          <button className="text-sm text-neutral-400 hover:text-white transition">
            Docs
          </button>
          <button className="px-4 py-2 rounded-lg bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition">
            Launch
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
