import React from "react";
import { motion } from "framer-motion";

const PARTICLE_COUNT = 20;

const rand = (min, max) => Math.random() * (max - min) + min;

export default function FloatingParticles() {
  const particles = React.useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map(() => ({
        size: rand(1, 3),
        x: rand(5, 95),
        y: rand(5, 95),
        duration: rand(15, 30),
        delay: rand(0, 8),
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Subtle floating dots */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-emerald-400/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
