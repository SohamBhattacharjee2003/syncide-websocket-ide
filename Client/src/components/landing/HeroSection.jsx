import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative text-5xl md:text-6xl font-bold"
      >
        Sync<span className="text-emerald-400">IDE</span>
      </motion.h1>

      <p className="relative mt-6 max-w-2xl text-lg text-neutral-400">
        The core engine for real-time collaborative coding.
      </p>
    </section>
  );
}
