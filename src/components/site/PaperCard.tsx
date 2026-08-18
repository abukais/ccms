import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PaperCardProps extends HTMLMotionProps<"div"> {
  tape?: "left" | "right" | "both" | "none";
  tilt?: number;
  children: ReactNode;
  className?: string;
}

export function PaperCard({ children, className, tape = "none", tilt = 0, ...rest }: PaperCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, rotate: tilt * 0.3 - 0.4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      style={{ rotate: tilt }}
      className={cn("paper-card relative p-6", className)}
      {...rest}
    >
      {(tape === "left" || tape === "both") && (
        <span className="pointer-events-none absolute -top-3 left-6 w-16 h-5 rotate-[-6deg] bg-tape rounded-[3px] shadow-sm mix-blend-multiply" />
      )}
      {(tape === "right" || tape === "both") && (
        <span className="pointer-events-none absolute -top-3 right-6 w-16 h-5 rotate-[7deg] bg-tape rounded-[3px] shadow-sm mix-blend-multiply" />
      )}
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, hand, className }: { eyebrow?: string; title: ReactNode; hand?: string; className?: string }) {
  return (
    <div className={cn("mb-10", className)}>
      {hand && <div className="hand text-3xl text-flame -mb-1">{hand}</div>}
      {eyebrow && <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">{eyebrow}</div>}
      <h2 className="text-4xl md:text-5xl font-black leading-[1.05]">{title}</h2>
    </div>
  );
}

export function InkButton({ children, onClick, variant = "primary", type = "button", className }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; type?: "button" | "submit"; className?: string }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ y: 1, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-shadow",
        variant === "primary"
          ? "bg-flame text-white shadow-[0_6px_0_-1px_rgba(0,0,0,0.7),0_10px_20px_-6px_rgba(247,147,26,0.5)] hover:shadow-[0_4px_0_-1px_rgba(0,0,0,0.7),0_16px_28px_-6px_rgba(247,147,26,0.55)]"
          : "bg-paper border border-ink/20 text-ink hover:border-ink/60",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}