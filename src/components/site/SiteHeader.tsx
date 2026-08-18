import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/csc-logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/submit", label: "Submit" },
  { to: "/track", label: "Track" },
  { to: "/suggestions", label: "Suggestions" },
  { to: "/faqs", label: "FAQs" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
      className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60"
    >
      <div className="relative mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <div className="pointer-events-none absolute -top-2 left-24 w-20 h-6 rotate-[-6deg] rounded-[3px] bg-tape shadow-sm mix-blend-multiply" />
        <div className="pointer-events-none absolute -top-2 right-40 w-16 h-5 rotate-[8deg] rounded-[3px] bg-tape shadow-sm mix-blend-multiply" />

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="CSC" width={140} className="h-10 w-auto object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="group relative px-3 py-2 text-sm font-medium text-ink/80 hover:text-ink transition-colors"
              activeProps={{ className: "text-flame" }}
            >
              {l.label}
              <span className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[3px] rounded-full bg-flame scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 [.text-flame_&]:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/submit"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-flame text-white px-4 py-2 text-sm font-semibold hover:bg-flame/90 transition-transform hover:-translate-y-0.5"
          >
            Submit →
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full bg-paper-warm border"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur px-6 py-4 flex flex-col gap-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 text-base font-medium">
              {l.label}
            </Link>
          ))}
          <Link to="/submit" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center gap-2 rounded-full bg-flame text-white px-4 py-2 text-sm font-semibold w-fit">
            Submit Now →
          </Link>
        </div>
      )}
    </motion.header>
  );
}
