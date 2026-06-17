"use client";

import { motion } from "framer-motion";
import React from "react";

export type ShapeType = "circle" | "square" | "diamond" | "triangle" | "hexagon" | "octagon";

interface AnimatedRingProps {
  children: React.ReactNode;
  shape?: ShapeType;
  color?: string;
}

const shapesData = {
  circle: {
    dashed: <circle cx="50" cy="50" r="45" />,
    inner: <circle cx="50" cy="50" r="38" />,
  },
  square: {
    dashed: <rect x="5" y="5" width="90" height="90" />,
    inner: <rect x="12" y="12" width="76" height="76" />,
  },
  diamond: {
    dashed: <polygon points="50,5 95,50 50,95 5,50" />,
    inner: <polygon points="50,15 85,50 50,85 15,50" />,
  },
  triangle: {
    dashed: <polygon points="50,5 95,90 5,90" />,
    inner: <polygon points="50,18 82,80 18,80" />,
  },
  hexagon: {
    dashed: <polygon points="25,5 75,5 95,50 75,95 25,95 5,50" />,
    inner: <polygon points="30,12 70,12 87,50 70,88 30,88 13,50" />,
  },
  octagon: {
    dashed: <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" />,
    inner: <polygon points="34,12 66,12 88,34 88,66 66,88 34,88 12,66 12,34" />,
  },
};

export function AnimatedRing({ children, shape = "circle", color = "#00ff41" }: AnimatedRingProps) {
  // Generate random dots around the ring orbit
  const dots = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * 360) / 8;
    return {
      id: i,
      angle,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    };
  });

  const { dashed, inner } = shapesData[shape];

  return (
    <div className="relative inline-flex items-center justify-center group cursor-pointer">
      {/* The Letter */}
      <span className="relative z-10 transition-all duration-300 group-hover:text-transparent group-hover:[-webkit-text-stroke:2px_var(--hover-color)]" style={{ "--hover-color": color } as React.CSSProperties}>
        {children}
      </span>

      {/* Orbiting Ring Container */}
      <motion.div
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        style={{ width: "180%", height: "180%", left: "-40%", top: "-40%" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          
          {/* Dashed background shape */}
          {React.cloneElement(dashed, {
            fill: "none",
            stroke: "white",
            strokeWidth: "0.5",
            strokeDasharray: "4 4",
          })}

          {/* Floating dots on the orbit */}
          {dots.map((dot) => (
            <motion.circle
              key={dot.id}
              cx="50"
              cy="5"
              r="2"
              fill={color}
              style={{ originX: "50px", originY: "50px", rotate: dot.angle, filter: `drop-shadow(0 0 8px ${color})` }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: dot.duration,
                repeat: Infinity,
                delay: dot.delay,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Inner shape */}
          {React.cloneElement(inner, {
            fill: "none",
            stroke: color,
            strokeWidth: "0.4",
            opacity: 0.5,
          })}
        </svg>
      </motion.div>

      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-full z-[-1]" 
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
