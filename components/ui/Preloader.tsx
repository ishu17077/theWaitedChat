"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { customEase, getWordConfig } from "@/lib/preloader-animations";

const buzzWords = ["The...", "Chat...", "that....", "wait", "TheWaitedChat"];

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    
    // Total animation time 9 seconds (extra delay)
    const duration = 9000; 
    const startTime = Date.now();
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      // Use an ease-out calculation for the number counter so it slows down near 100
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      const currentProgress = Math.min(Math.round(easedProgress * 100), 100);
      
      setProgress(currentProgress);

      // Change words a few times during the sequence
      const newWordIndex = Math.floor(rawProgress * buzzWords.length);
      setWordIndex(Math.min(newWordIndex, buzzWords.length - 1));

      if (rawProgress >= 1) {
        setTimeout(() => {
          setIsLoading(false);
          document.body.style.overflow = "auto";
        }, 400); // short pause at 100 before splitting
      } else {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    // Fallback to guarantee unmount if requestAnimationFrame fails or tab is backgrounded
    const fallbackTimeout = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "auto";
    }, duration + 1500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(fallbackTimeout);
      document.body.style.overflow = "auto";
    };
  }, []);

  // Columns for the split reveal effect
  const columns = 5;

  return (
    <AnimatePresence>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex pointer-events-none">
          {/* Staggered Column Reveal */}
          {Array.from({ length: columns }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0 }}
              exit={{ 
                y: "-100%", 
                transition: { 
                  duration: 1.2, 
                  ease: customEase, 
                  delay: i * 0.08 
                } 
              }}
              className="h-full bg-black flex-1 border-r border-white/5 last:border-none"
            />
          ))}

          {/* Foreground Content */}
          <motion.div 
            exit={{ opacity: 0, transition: { duration: 0.4, ease: customEase } }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Background huge outlined number */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-10">
              <span 
                className="text-[40vw] font-bold font-sans text-transparent"
                style={{ WebkitTextStroke: "2px white" }}
              >
                {progress}
              </span>
            </div>

            {/* Center Dynamic Typography */}
            <div className="relative overflow-hidden h-32 md:h-40 flex items-center">
              <AnimatePresence mode="wait">
                {(() => {
                  const word = buzzWords[wordIndex];
                  const config = getWordConfig(word);
                  return (
                    <motion.h2
                      key={wordIndex}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={config.container}
                      className={`text-4xl md:text-6xl uppercase flex overflow-visible px-4 ${config.className}`}
                    >
                      {word.split("").map((char, i) => (
                        <motion.span 
                          key={i} 
                          variants={config.letter}
                          className="inline-block"
                        >
                          {char === " " ? "\u00A0" : char}
                        </motion.span>
                      ))}
                    </motion.h2>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* Bottom Progress Line */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-white/20 overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
