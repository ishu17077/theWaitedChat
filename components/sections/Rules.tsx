"use client";

import { motion } from "framer-motion";
import { TerminalSquare, Ban, Globe, Cpu, Timer, ShieldAlert } from "lucide-react";

const rules = [
  {
    icon: <TerminalSquare className="w-6 h-6" />,
    text: "Teams must build the website entirely using any Vanilla JS, React based framework.",
  },
  {
    icon: <Ban className="w-6 h-6" />,
    text: "Pre-built website templates and cloned projects will not be allowed.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    text: "Deployment must be completed on Vercel, Netlify or Render before submission.",
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    text: "All code and assets used during development must be original or properly credited.",
  },
  {
    icon: <Timer className="w-6 h-6" />,
    text: "Teams must complete the project within the allotted event duration.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    text: "Internet access may be used only for learning resources and documentation.",
  },
  {
    icon: <ShieldAlert className="w-6 h-6" />,
    text: "Any form of plagiarism or unfair means will lead to disqualification.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export function Rules() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-5xl mx-auto z-10 relative">
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight flex items-center justify-center">
          <span className="text-matrix mr-4 font-mono text-xl md:text-2xl opacity-70">02.</span>
          Rules of Engagement
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid gap-4"
      >
        {rules.map((rule, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="group glass-panel p-6 rounded-xl flex items-start space-x-6 hover:border-matrix/50 transition-colors duration-300 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-matrix/0 group-hover:bg-matrix transition-all duration-300" />
            <div className="text-matrix/70 group-hover:text-matrix transition-colors duration-300 mt-1">
              {rule.icon}
            </div>
            <p className="text-gray-300 font-sans text-lg md:text-xl group-hover:text-white transition-colors duration-300">
              {rule.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
