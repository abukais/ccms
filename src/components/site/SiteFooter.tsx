import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative mt-24">
      <div className="h-10 bg-ink torn-top" />
      <div className="bg-ink text-background/90">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="hand text-3xl text-flame">Your Voice.</div>
            <div className="font-display text-4xl font-bold">Our Action.</div>
            <p className="mt-4 max-w-sm text-background/70 text-sm leading-relaxed">
              A student-first platform by Chandrabhan Sharma College to listen,
              respond, and improve — one page at a time.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-flame mb-4">Explore</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/submit" className="hover:text-flame transition">Submit a Complaint</Link></li>
              <li><Link to="/track" className="hover:text-flame transition">Track Status</Link></li>
              <li><Link to="/suggestions" className="hover:text-flame transition">Suggestions</Link></li>
              <li><Link to="/faqs" className="hover:text-flame transition">FAQs</Link></li>
              <li><Link to="/about" className="hover:text-flame transition">About</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-flame mb-4">Reach us</div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> CSC Campus, Mumbai, India</li>
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /> voice@csc.edu.in</li>
              <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /> +91 22 0000 0000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10">
          <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between text-xs text-background/60">
            <div>© {new Date().getFullYear()} Chandrabhan Sharma College. All rights reserved.</div>
            <div className="flex items-center gap-1">Handcrafted with <Heart className="h-3 w-3 text-flame fill-flame" /> for students</div>
          </div>
        </div>
      </div>
    </footer>
  );
}