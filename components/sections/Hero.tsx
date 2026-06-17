"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { AnimatedRing } from "../ui/AnimatedRing";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-10 px-4">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-matrix-dark)_0%,_transparent_70%)] opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center flex flex-col items-center max-w-4xl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mb-6 flex items-center justify-center space-x-3 text-matrix border border-matrix/30 px-6 py-2 rounded-full glass-panel"
        >
          <Terminal size={20} className="text-matrix animate-pulse" />
          <span className="font-mono text-sm tracking-widest uppercase">System Initialization</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold font-sans tracking-tighter mb-6 text-glow flex items-center justify-center"
        >
          {[
            { char: "T", shape: "hexagon", color: "#ff0055" },
            { char: "h", shape: "circle", color: "#00ff41" },
            { char: "e", shape: "triangle", color: "#00aaff" },
            { char: "C", shape: "octagon", color: "#ffaa00" },
            { char: "h", shape: "diamond", color: "#aa00ff" },
            { char: "a", shape: "circle", color: "#ff00aa" },
            { char: "t", shape: "hexagon", color: "#00ffff" },
            { char: "A", shape: "triangle", color: "#aaff00" },
            { char: "p", shape: "diamond", color: "#ff5500" },
            { char: "p", shape: "circle", color: "#ff0055" },
          ].map((item, i) => (
            <AnimatedRing key={i} shape={item.shape as any} color={item.color}>
              {item.char}
            </AnimatedRing>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-xl md:text-3xl font-mono text-matrix mb-8"
        >
          &gt; Exclusively For College Students_
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="px-8 py-4 font-mono font-bold text-black bg-matrix hover:bg-white transition-colors duration-300 rounded-sm">
            [ INITIALIZE ]
          </button>
          <button className="px-8 py-4 font-mono font-bold text-matrix border border-matrix hover:bg-matrix/10 transition-colors duration-300 rounded-sm glass-panel">
            [ VIEW_DOCS ]
          </button>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce text-matrix/50">
        <span className="font-mono text-xs tracking-widest uppercase">Scroll Down</span>
      </div>
    </section>
  );
}
