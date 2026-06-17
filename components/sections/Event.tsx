"use client";

import { motion } from "framer-motion";

export function Event() {
  return (
    <section className="relative py-40 flex items-center justify-center overflow-hidden">
      {/* Background glow for elegance */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[800px] h-[400px] bg-white/5 rounded-[100%] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center z-10 px-4"
      >
        <span className="block font-mono text-matrix text-sm tracking-[0.3em] uppercase mb-8">
          The Grand Stage
        </span>
        <h2 className="font-cursive text-7xl md:text-9xl text-white mb-6 leading-tight select-none">
          WebManiac
        </h2>
        <div className="flex items-center justify-center space-x-6 text-gray-400 font-sans">
          <span className="tracking-widest uppercase text-xs">Innovation</span>
          <div className="w-1.5 h-1.5 rounded-full bg-matrix" />
          <span className="tracking-widest uppercase text-xs">Aesthetics</span>
          <div className="w-1.5 h-1.5 rounded-full bg-matrix" />
          <span className="tracking-widest uppercase text-xs">Code</span>
        </div>
      </motion.div>
    </section>
  );
}
