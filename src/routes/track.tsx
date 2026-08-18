import { createFileRoute, useSearch } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, CheckCircle2, Circle, Clock, CheckCheck, ChevronDown, ChevronUp, MessageSquare, Image as ImageIcon } from "lucide-react";
import { PaperCard, InkButton, SectionHeading } from "@/components/site/PaperCard";
import { getSubmissionByTicketId, STATUS_LABELS, STATUS_ORDER } from "@/lib/api";
import type { Submission, SubmissionStatus } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) ?? "" }),
  head: () => ({ meta: [{ title: "Track Your Complaint | CSC" }] }),
  component: TrackPage,
});

const STATUS_ICONS: Record<SubmissionStatus, React.ReactNode> = {
  submitted:    <CheckCircle2 className="h-5 w-5" />,
  under_review: <Clock className="h-5 w-5" />,
  forwarded:    <Search className="h-5 w-5" />,
  resolved:     <CheckCheck className="h-5 w-5" />,
};

const STATUS_PILL: Record<SubmissionStatus, string> = {
  submitted:    "bg-green-100 text-green-700 border-green-300",
  under_review: "bg-blue-100 text-blue-700 border-blue-300",
  forwarded:    "bg-amber-100 text-amber-700 border-amber-300",
  resolved:     "bg-flame/15 text-flame border-flame/40",
};

function TrackPage() {
  const { id: prefilled } = useSearch({ from: "/track" });
  const [ticketId, setTicketId] = useState(prefilled ?? "");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<Submission | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(true);

  useEffect(() => { if (prefilled) search(prefilled); }, [prefilled]);

  async function search(id?: string) {
    const q = (id ?? ticketId).trim().toUpperCase();
    if (!q) { toast.error("Enter a ticket ID first."); return; }
    setLoading(true); setResult(null); setNotFound(false);
    const { data, error } = await getSubmissionByTicketId(q);
    setLoading(false);
    if (error || !data) { setNotFound(true); return; }
    setResult(data);
  }

  const idx = result ? STATUS_ORDER.indexOf(result.status) : -1;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading hand="Check Status" title={<>Track your <span className="text-flame">Ticket</span></>} />

        {/* search bar */}
        <PaperCard tape="left" className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={ticketId} onChange={(e) => setTicketId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Ticket ID — e.g. CSC-2026-123456"
                className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 pl-11 pr-4 py-3 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition font-mono text-sm" />
            </div>
            <InkButton onClick={() => search()}>{loading ? "Searching…" : "Track Now"}</InkButton>
          </div>
        </PaperCard>

        {loading && <div className="mt-10 flex justify-center"><div className="h-8 w-8 border-4 border-flame/30 border-t-flame rounded-full animate-spin" /></div>}

        {notFound && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
            <PaperCard className="p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-bold text-lg">No ticket found</div>
              <p className="text-muted-foreground text-sm mt-1">Double-check the ticket ID and try again.</p>
            </PaperCard>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">

            {/* header */}
            <PaperCard tape="both" className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{result.ticket_id}</div>
                  <div className="font-bold text-xl mt-1">{result.subject}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-ink text-white capitalize">{result.type}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-paper-warm border">{result.category}</span>
                    {result.department && <span className="text-xs px-3 py-1 rounded-full bg-paper-warm border">{result.department}</span>}
                    {result.is_anonymous && <span className="text-xs px-3 py-1 rounded-full bg-paper-warm border text-muted-foreground">Anonymous</span>}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${STATUS_PILL[result.status]}`}>
                  {STATUS_LABELS[result.status]}
                </span>
              </div>
              <p className="mt-4 text-sm text-ink/75 leading-relaxed border-t pt-4">{result.description}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                Submitted {new Date(result.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </PaperCard>

            {/* images */}
            {result.image_urls?.length > 0 && (
              <PaperCard className="p-6">
                <div className="font-bold mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-flame" /> Attached Images
                  <span className="text-xs font-normal text-muted-foreground">({result.image_urls.length})</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.image_urls.map((url, i) => (
                    <button key={i} onClick={() => setLightbox(url)}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-ink/15 hover:ring-2 hover:ring-flame transition">
                      <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const ph = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (ph) ph.style.display = "flex";
                        }} />
                      <div style={{ display: "none" }} className="absolute inset-0 flex-col items-center justify-center bg-gray-100 text-gray-400 text-xs gap-1">
                        <ImageIcon className="h-5 w-5" /><span>Image</span>
                      </div>
                    </button>
                  ))}
                </div>
              </PaperCard>
            )}

            {/* timeline */}
            <PaperCard className="p-6">
              <div className="font-bold mb-5">Status Timeline</div>
              <div>
                {STATUS_ORDER.map((s, i) => {
                  const done   = i <= idx;
                  const active = i === idx;
                  const event  = (result.status_history ?? []).find((e) => e.status === s);
                  return (
                    <div key={s} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition
                          ${done ? "bg-flame border-flame text-white" : "bg-paper border-ink/20 text-ink/30"}
                          ${active ? "ring-4 ring-flame/20" : ""}`}>
                          {done ? STATUS_ICONS[s] : <Circle className="h-4 w-4" />}
                        </div>
                        {i < STATUS_ORDER.length - 1 && <div className={`w-0.5 h-8 ${done && i < idx ? "bg-flame" : "bg-ink/10"}`} />}
                      </div>
                      <div className="pb-8 pt-1.5">
                        <div className={`font-semibold text-sm ${done ? "text-ink" : "text-ink/35"}`}>{STATUS_LABELS[s]}</div>
                        {event && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(event.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                        {event?.note && <div className="mt-1 text-xs text-flame italic">"{event.note}"</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </PaperCard>

            {/* admin notes */}
            {(result.admin_notes ?? []).length > 0 && (
              <PaperCard className="p-6">
                <button onClick={() => setShowNotes((v) => !v)} className="w-full flex items-center justify-between font-bold text-sm">
                  <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-flame" /> Notes from Admin ({result.admin_notes.length})</span>
                  {showNotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showNotes && (
                  <div className="mt-4 space-y-3">
                    {result.admin_notes.map((n, i) => (
                      <div key={i} className="rounded-xl bg-flame/8 border border-flame/20 px-4 py-3">
                        <p className="text-sm text-ink/80">{n.text}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(n.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PaperCard>
            )}
          </motion.div>
        )}
      </div>

      {/* lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full size" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 text-xl">✕</button>
        </div>
      )}
    </section>
  );
}
