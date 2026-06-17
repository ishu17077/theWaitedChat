export const customEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

export const getWordConfig = (word: string) => {
  switch (word) {
    case "INNOVATION":
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.02, staggerDirection: -1 } },
        },
        letter: {
          hidden: { scale: 2, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: customEase } },
          exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
        },
        className: "text-blue-200 tracking-widest",
      };
    case "AESTHETICS":
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.01 } },
        },
        letter: {
          hidden: { y: -100, opacity: 0, rotateX: 90 },
          visible: { y: 0, opacity: 1, rotateX: 0, transition: { duration: 0.5, ease: customEase } },
          exit: { y: 100, opacity: 0, rotateX: -90, transition: { duration: 0.2 } },
        },
        className: "text-white tracking-[0.5em] font-light",
      };
    case "CODE":
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
        },
        letter: {
          hidden: { y: 50, opacity: 0, color: "#000" },
          visible: { y: 0, opacity: 1, color: "#00ff41", transition: { duration: 0.3, type: "spring" as const, stiffness: 200 } },
          exit: { y: -50, opacity: 0, transition: { duration: 0.2 } },
        },
        className: "font-mono font-bold tracking-tight text-matrix",
      };
    case "CREATIVITY":
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.02 } },
        },
        letter: {
          hidden: { y: 100, opacity: 0, rotate: -45 },
          visible: { y: 0, opacity: 1, rotate: 0, transition: { duration: 0.4, type: "spring" as const, bounce: 0.5 } },
          exit: { y: 100, opacity: 0, rotate: 45, transition: { duration: 0.2 } },
        },
        className: "text-pink-400 font-serif italic tracking-wide",
      };
    case "WEBMANIAC":
    default:
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.02, staggerDirection: -1 } },
        },
        letter: {
          hidden: { x: -50, opacity: 0, skewX: 20 },
          visible: { x: 0, opacity: 1, skewX: 0, transition: { duration: 0.4, ease: customEase } },
          exit: { x: 50, opacity: 0, skewX: -20, transition: { duration: 0.2 } },
        },
        className: "text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 font-extrabold tracking-tighter",
      };
  }
};
