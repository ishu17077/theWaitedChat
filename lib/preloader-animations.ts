export const customEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

export const getWordConfig = (word: string) => {
  switch (word) {
    case "The...":
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
        },
        letter: {
          hidden: { filter: "blur(10px)", opacity: 0 },
          visible: { filter: "blur(0px)", opacity: 1, transition: { duration: 0.8, ease: customEase } },
          exit: { filter: "blur(10px)", opacity: 0, transition: { duration: 0.3 } },
        },
        className: "text-blue-300 font-serif italic tracking-widest",
      };
    case "Chat...":
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.04 } },
        },
        letter: {
          hidden: { y: 50, opacity: 0, scale: 0.5 },
          visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring" as const, bounce: 0.6 } },
          exit: { y: -50, opacity: 0, scale: 0.5, transition: { duration: 0.3 } },
        },
        className: "text-matrix font-mono font-bold tracking-[0.3em]",
      };
    case "that....":
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
        },
        letter: {
          hidden: { x: -50, opacity: 0, rotateY: 90 },
          visible: { x: 0, opacity: 1, rotateY: 0, transition: { duration: 0.6, ease: customEase } },
          exit: { x: 50, opacity: 0, rotateY: -90, transition: { duration: 0.3 } },
        },
        className: "text-white tracking-widest font-light",
      };
    case "wait":
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          exit: { opacity: 0, transition: { staggerChildren: 0.05 } },
        },
        letter: {
          hidden: { opacity: 0, scale: 1.5, filter: "brightness(0)" },
          visible: { opacity: 1, scale: 1, filter: "brightness(1)", transition: { duration: 1, ease: customEase } },
          exit: { opacity: 0, scale: 0.8, filter: "brightness(0)", transition: { duration: 0.4 } },
        },
        className: "text-red-500 font-extrabold tracking-[0.5em] uppercase",
      };
    case "TheWaitedChat":
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
