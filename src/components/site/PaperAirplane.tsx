import { motion } from "motion/react";

export function PaperAirplane() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-30"
      initial={{ x: "-10vw", y: "70vh", rotate: -8, opacity: 0 }}
      animate={{
        x: ["-10vw", "40vw", "110vw"],
        y: ["70vh", "30vh", "60vh"],
        rotate: [-8, 6, -4],
        opacity: [0, 1, 0],
      }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    >
      <svg width="52" height="52" viewBox="0 0 64 64" className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.15)]">
        <path d="M2 30 L62 4 L46 60 L34 38 Z" fill="#fff" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M34 38 L62 4" stroke="#111" strokeWidth="1.5" fill="none"/>
        <path d="M2 30 L34 38 L22 52 Z" fill="#F7931A" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    </motion.div>
  );
}

export function TornDivider({ color = "bg-ink", direction = "top" as "top" | "bottom" }) {
  return <div className={`h-10 ${color} ${direction === "top" ? "torn-top" : "torn-bottom"}`} />;
}