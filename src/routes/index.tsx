import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Send, Search, Lightbulb, ArrowRight, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { PaperCard, SectionHeading, InkButton } from "@/components/site/PaperCard";
import { ArrowDoodle, UnderlineDoodle, StarDoodle } from "@/components/site/Doodles";
import { PaperAirplane } from "@/components/site/PaperAirplane";
import { getSubmissions } from "@/lib/api";
import type { Submission } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CSC Complain & Suggest Portal" },
      { name: "description", content: "Submit and track complaints and suggestions at Chandrabhan Sharma College." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, suggestions: 0 });

  useEffect(() => {
    getSubmissions().then(({ data }) => {
      const total = data.length;
      const resolved = data.filter((s) => s.status === "resolved").length;
      const suggestions = data.filter((s) => s.type === "suggestion").length;
      setStats({ total, resolved, suggestions });
    });
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <PaperAirplane />
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="hand text-4xl text-flame -mb-2">Student Voice Portal</div>
            <h1 className="font-display text-6xl md:text-7xl font-black leading-[0.92] tracking-tight">
              Your Complaint.<br />
              <span className="relative inline-block">
                Our Action.
                <UnderlineDoodle className="absolute -bottom-3 left-0 w-full text-flame" />
              </span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Anonymous or signed — every complaint is stamped, tracked, and acted upon.
              Chandrabhan Sharma College listens.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/submit">
                <InkButton><Send className="h-4 w-4" /> Submit Now</InkButton>
              </Link>
              <Link to="/track">
                <InkButton variant="ghost"><Search className="h-4 w-4" /> Track Ticket</InkButton>
              </Link>
            </div>
          </motion.div>

          {/* stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: -1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <PaperCard tape="both" className="p-8 space-y-4">
              <StarDoodle className="absolute -top-5 -right-3 w-10 text-flame" />
              <div className="hand text-2xl text-flame">Live Stats</div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Submissions", value: stats.total, icon: <TrendingUp className="h-5 w-5" /> },
                  { label: "Resolved", value: stats.resolved, icon: <CheckCircle className="h-5 w-5 text-green-600" /> },
                  { label: "Suggestions", value: stats.suggestions, icon: <Lightbulb className="h-5 w-5 text-amber-500" /> },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-flame/10 text-flame mb-2 mx-auto">{s.icon}</div>
                    <div className="font-display text-3xl font-black">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </PaperCard>
            <ArrowDoodle className="absolute -left-10 -bottom-8 w-20 text-ink rotate-90" />
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-paper-warm/40">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading hand="Simple Process" title={<>Three steps, <span className="text-flame">done.</span></>} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: <Send className="h-6 w-6" />, title: "Submit", body: "Fill the paper form — complaint or suggestion. Add attachments. Toggle anonymous if you prefer." },
              { step: "02", icon: <Clock className="h-6 w-6" />, title: "Track", body: "Get a ticket ID instantly. Check its live status timeline any time from the Track page." },
              { step: "03", icon: <CheckCircle className="h-6 w-6" />, title: "Resolved", body: "Submissions move through review → forwarded → resolved. Transparent at every stage." },
            ].map((c, i) => (
              <motion.div key={c.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <PaperCard tilt={i === 1 ? 0 : i === 0 ? -1 : 1} tape={i === 1 ? "both" : "none"} className="p-8 h-full">
                  <div className="hand text-4xl text-flame/30 mb-4">{c.step}</div>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-flame/10 text-flame mb-4">{c.icon}</div>
                  <div className="font-bold text-xl mb-2">{c.title}</div>
                  <p className="text-sm text-ink/70 leading-relaxed">{c.body}</p>
                </PaperCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent suggestions ── */}
      <RecentSuggestions />

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <PaperCard tape="left" className="p-10 md:p-14 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="hand text-3xl text-flame">Ready?</div>
              <div className="font-display text-4xl font-black">Make your voice heard.</div>
              <div className="text-muted-foreground mt-1">Anonymous, safe, and always read.</div>
            </div>
            <Link to="/submit">
              <InkButton><ArrowRight className="h-4 w-4" /> Submit now</InkButton>
            </Link>
          </PaperCard>
        </div>
      </section>
    </>
  );
}

function RecentSuggestions() {
  const [items, setItems] = useState<Submission[]>([]);
  useEffect(() => {
    getSubmissions({ type: "suggestion" }).then(({ data }) => setItems(data.slice(0, 3)));
  }, []);

  if (!items.length) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between mb-10">
          <SectionHeading hand="From students" title={<>Latest <span className="text-flame">Suggestions</span></>} className="mb-0" />
          <Link to="/suggestions" className="text-sm font-semibold text-flame hover:underline flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <PaperCard className="p-6 h-full flex flex-col gap-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-ink/5 border text-ink/60 w-fit">{s.category}</span>
                <div className="font-bold">{s.subject}</div>
                <p className="text-sm text-ink/65 leading-relaxed line-clamp-2">{s.description}</p>
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-ink/8">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs text-muted-foreground">{s.upvotes} upvotes</span>
                </div>
              </PaperCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
