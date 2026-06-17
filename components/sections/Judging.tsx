"use client";

import { motion } from "framer-motion";

const criteria = [
  { title: "Creativity & Innovation", score: "90+", size: "md:col-span-2 md:row-span-2" },
  { title: "Functionality & Responsiveness", score: "100%", size: "md:col-span-1 md:row-span-1" },
  { title: "Code Quality", score: "A+", size: "md:col-span-1 md:row-span-1" },
  { title: "Deployment Success", score: "OK", size: "md:col-span-1 md:row-span-1" },
  { title: "Visual Appeal and user Experience", score: "WOW", size: "md:col-span-2 md:row-span-1" },
  { title: "Problem Solving", score: "MAX", size: "md:col-span-1 md:row-span-1" },
  { title: "Unique from Generic AI", score: "100%", size: "md:col-span-3 md:row-span-1 bg-matrix/10 border-matrix/50" },
];

export function Judging() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight flex items-center justify-center">
          <span className="text-matrix mr-4 font-mono text-xl md:text-2xl opacity-70">03.</span>
          Judging Criteria
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[150px]">
        {criteria.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`glass-panel p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors duration-300 group ${item.size}`}
          >
            <h3 className="font-sans text-xl md:text-2xl font-bold text-gray-200 group-hover:text-white transition-colors duration-300">
              {item.title}
            </h3>
            <div className="flex justify-end">
              <span className="font-mono text-matrix opacity-50 text-2xl group-hover:opacity-100 transition-opacity duration-300">
                [{item.score}]
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
