import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ThumbsUp, Search, Loader2, RefreshCcw } from "lucide-react";
import { PaperCard, SectionHeading } from "@/components/site/PaperCard";
import { getSubmissions, upvoteSubmission } from "@/lib/api";
import type { Submission } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/suggestions")({
  head: () => ({
    meta: [{ title: "Community Suggestions | CSC" }],
  }),
  component: SuggestionsPage,
});

const CATEGORIES = ["All", "Infrastructure", "Academics", "Hostel", "Cafeteria", "Faculty", "Events", "Other"];

const STATUS_BADGE: Record<string, string> = {
  submitted:    "bg-gray-100 text-gray-600",
  under_review: "bg-blue-100 text-blue-700",
  forwarded:    "bg-amber-100 text-amber-700",
  resolved:     "bg-green-100 text-green-700",
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted", under_review: "Under Review", forwarded: "In Progress", resolved: "Completed",
};

function SuggestionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [voted, setVoted] = useState<Set<string>>(new Set());

  async function load(cat: string) {
    setLoading(true);
    const { data } = await getSubmissions({
      type: "suggestion",
      category: cat !== "All" ? cat : undefined,
    });
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { load(category); }, [category]);

  const filtered = items.filter((s) =>
    s.subject.toLowerCase().includes(query.toLowerCase()) ||
    s.description.toLowerCase().includes(query.toLowerCase())
  );

  async function handleUpvote(item: Submission) {
    if (voted.has(item.id)) { toast.info("You've already upvoted this."); return; }
    setVoted((v) => new Set(v).add(item.id));
    setItems((prev) => prev.map((s) => s.id === item.id ? { ...s, upvotes: s.upvotes + 1 } : s));
    const { error } = await upvoteSubmission(item.id, item.upvotes);
    if (error) {
      toast.error("Could not record vote.");
      setVoted((v) => { const n = new Set(v); n.delete(item.id); return n; });
      setItems((prev) => prev.map((s) => s.id === item.id ? { ...s, upvotes: s.upvotes - 1 } : s));
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading hand="Community" title={<>Student <span className="text-flame">Suggestions</span></>} />

        {/* filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search suggestions…"
              className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 pl-11 pr-4 py-2.5 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${category === c ? "bg-flame text-white border-flame" : "bg-paper border-ink/20 hover:border-flame hover:text-flame"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => load(category)} className="ml-auto p-2.5 rounded-xl border border-ink/15 hover:border-flame transition">
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-flame" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <PaperCard className="p-12 text-center">
            <div className="text-4xl mb-3">💡</div>
            <div className="font-bold text-lg">No suggestions yet</div>
            <p className="text-muted-foreground text-sm mt-1">Be the first — <a href="/submit" className="text-flame underline">submit one now</a>.</p>
          </PaperCard>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}>
                <PaperCard className="p-6 h-full flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-ink/5 border text-ink/60">{item.category}</span>
                    </div>
                    <div className="font-bold text-base leading-snug">{item.subject}</div>
                    <p className="text-sm text-ink/65 mt-2 leading-relaxed line-clamp-3">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-ink/8">
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                    <button
                      onClick={() => handleUpvote(item)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition
                        ${voted.has(item.id) ? "bg-flame text-white border-flame" : "hover:bg-flame/10 hover:border-flame hover:text-flame border-ink/20"}`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {item.upvotes}
                    </button>
                  </div>
                </PaperCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
