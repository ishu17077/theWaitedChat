"use client";

import { motion } from "framer-motion";
import { TerminalUI } from "../ui/TerminalUI";

export function About() {
  return (
    <section className="relative py-32 px-4 md:px-8 max-w-7xl mx-auto z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="glass-panel rounded-3xl p-8 md:p-16 border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-matrix-dark/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-6 flex items-center">
              <span className="text-matrix mr-4 font-mono text-xl md:text-2xl opacity-70">01.</span>
              About the Challenge
            </h2>
            <div className="h-1 w-20 bg-matrix mb-8 rounded" />
            
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-sans mb-6">
              Turn ideas into live websites through creativity, coding, and rapid problem solving.
            </p>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-sans">
              Build a fully functional web experience using Vanilla JS or React based frameworks and deploy it on Vercel, Netlify, or Render. A fast paced challenge where innovation, teamwork, and smart design take center stage.
            </p>
          </div>

          <div className="flex w-full h-full min-h-[350px] justify-center md:justify-end">
            <TerminalUI />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
