import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import {
  LogOut, Search, RefreshCcw, ChevronDown, ChevronUp, Eye,
  MessageSquare, CheckCircle2, Clock, Send, Loader2,
  Image as ImageIcon, X, TrendingUp, AlertCircle, Lightbulb, CheckCheck, Filter,
} from "lucide-react";
import { adminLogin, adminLogout, isAdminLoggedIn } from "@/lib/adminAuth";
import { getSubmissions, adminUpdateStatus, adminAddNote, STATUS_LABELS, STATUS_ORDER } from "@/lib/api";
import type { Submission, SubmissionStatus } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel | CSC" }] }),
  component: AdminPage,
});

const STATUS_BG: Record<SubmissionStatus, string> = {
  submitted:    "bg-gray-100 text-gray-700",
  under_review: "bg-blue-100 text-blue-700",
  forwarded:    "bg-amber-100 text-amber-700",
  resolved:     "bg-green-100 text-green-700",
};

const TYPE_COLOR: Record<string, string> = {
  complaint:  "bg-red-100 text-red-700",
  suggestion: "bg-purple-100 text-purple-700",
};

// ── Root ──────────────────────────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(isAdminLoggedIn());
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { adminLogout(); setAuthed(false); }} />;
}

// ── Login ─────────────────────────────────────────────────────────────────
function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser]     = useState("");
  const [pass, setPass]     = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setLoading(true);
    setTimeout(() => {
      if (adminLogin(user, pass)) { onSuccess(); }
      else { setErr("Invalid username or password."); }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink to-ink/80 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="rounded-3xl bg-white shadow-2xl overflow-hidden">
          <div className="bg-flame px-8 py-6">
            <div className="font-display text-3xl font-black text-white">Admin Panel</div>
            <div className="text-white/70 text-sm mt-1">Chandrabhan Sharma College</div>
          </div>
          <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
            <div>
              <label className="text-sm font-semibold block mb-2">Username</label>
              <input autoFocus value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-2">Password</label>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition" />
            </div>
            {err && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {err}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-flame text-white py-3 font-semibold text-sm hover:bg-flame/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Verifying…" : "Sign In"}
            </button>
            <p className="text-center text-xs text-gray-400">This page is not linked anywhere. Authorised personnel only.</p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [items, setItems]         = useState<Submission[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [fType, setFType]         = useState<"all" | "complaint" | "suggestion">("all");
  const [fStatus, setFStatus]     = useState<"all" | SubmissionStatus>("all");
  const [fCat, setFCat]           = useState("All");
  const [selected, setSelected]   = useState<Submission | null>(null);

  const CATS = ["All","Infrastructure","Academics","Hostel","Cafeteria","Faculty","Events","Other"];

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getSubmissions({
      type:     fType   !== "all" ? fType   : undefined,
      status:   fStatus !== "all" ? fStatus : undefined,
      category: fCat,
      search,
    });
    setItems(data);
    setLoading(false);
  }, [fType, fStatus, fCat, search]);

  useEffect(() => { load(); }, [load]);

  const total       = items.length;
  const complaints  = items.filter((s) => s.type === "complaint").length;
  const suggestions = items.filter((s) => s.type === "suggestion").length;
  const resolved    = items.filter((s) => s.status === "resolved").length;

  function handleUpdate(updated: Submission) {
    setItems((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    if (selected?.id === updated.id) setSelected(updated);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* header */}
      <header className="bg-ink text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-flame flex items-center justify-center font-bold text-sm">A</div>
          <div>
            <div className="font-bold text-base leading-none">CSC Admin Panel</div>
            <div className="text-white/50 text-xs mt-0.5">Chandrabhan Sharma College</div>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <aside className="hidden lg:flex flex-col w-56 bg-white border-r p-4 gap-1 shrink-0 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Type</div>
          {(["all","complaint","suggestion"] as const).map((t) => (
            <button key={t} onClick={() => setFType(t)}
              className={`text-left px-3 py-2 rounded-lg text-sm capitalize font-medium transition ${fType === t ? "bg-flame/10 text-flame" : "text-gray-600 hover:bg-gray-100"}`}>
              {t === "all" ? "All Types" : t + "s"}
            </button>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mt-4 mb-2">Status</div>
          {(["all","submitted","under_review","forwarded","resolved"] as const).map((s) => (
            <button key={s} onClick={() => setFStatus(s)}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${fStatus === s ? "bg-flame/10 text-flame" : "text-gray-600 hover:bg-gray-100"}`}>
              {s === "all" ? "All Statuses" : STATUS_LABELS[s as SubmissionStatus]}
            </button>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mt-4 mb-2">Category</div>
          {CATS.map((c) => (
            <button key={c} onClick={() => setFCat(c)}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${fCat === c ? "bg-flame/10 text-flame" : "text-gray-600 hover:bg-gray-100"}`}>
              {c}
            </button>
          ))}
        </aside>

        {/* main */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total",       value: total,       icon: <TrendingUp className="h-5 w-5" />,  cls: "bg-ink text-white" },
              { label: "Complaints",  value: complaints,  icon: <AlertCircle className="h-5 w-5" />, cls: "bg-red-50 text-red-700" },
              { label: "Suggestions", value: suggestions, icon: <Lightbulb className="h-5 w-5" />,   cls: "bg-purple-50 text-purple-700" },
              { label: "Resolved",    value: resolved,    icon: <CheckCheck className="h-5 w-5" />,  cls: "bg-green-50 text-green-700" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-4 flex items-center gap-4 shadow-sm ${s.cls}`}>
                <div className="opacity-70">{s.icon}</div>
                <div><div className="text-2xl font-black">{s.value}</div><div className="text-xs opacity-70 font-medium">{s.label}</div></div>
              </div>
            ))}
          </div>

          {/* search + mobile filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket, subject, name…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition" />
            </div>
            <div className="flex lg:hidden gap-2">
              <select value={fType} onChange={(e) => setFType(e.target.value as typeof fType)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none">
                <option value="all">All Types</option>
                <option value="complaint">Complaints</option>
                <option value="suggestion">Suggestions</option>
              </select>
              <select value={fStatus} onChange={(e) => setFStatus(e.target.value as typeof fStatus)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none">
                <option value="all">All Statuses</option>
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <button onClick={load} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-flame transition flex items-center gap-2 text-sm text-gray-600">
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {/* table */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-flame" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Filter className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <div className="font-medium">No submissions match your filters</div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    {["Ticket ID","Type","Category","Subject","Status","Images","Date","Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className={`border-b last:border-0 hover:bg-gray-50/70 transition ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                      <td className="px-4 py-3 font-mono text-xs text-flame font-bold whitespace-nowrap">{item.ticket_id}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_COLOR[item.type]}`}>{item.type}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{item.category}</td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <div className="truncate font-medium text-gray-800">{item.subject}</div>
                        <div className="text-xs text-gray-400">{item.is_anonymous ? "Anonymous" : (item.name ?? "")}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BG[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                      </td>
                      <td className="px-4 py-3">
                        {(item.image_urls?.length ?? 0) > 0
                          ? <span className="flex items-center gap-1 text-xs text-flame"><ImageIcon className="h-3.5 w-3.5" />{item.image_urls.length}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(item)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-flame/10 text-flame font-semibold hover:bg-flame hover:text-white transition">
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selected && <DetailDrawer submission={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
      </AnimatePresence>
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────
function DetailDrawer({ submission, onClose, onUpdate }: {
  submission: Submission; onClose: () => void; onUpdate: (s: Submission) => void;
}) {
  const [newStatus, setNewStatus] = useState<SubmissionStatus>(submission.status);
  const [statusNote, setStatusNote] = useState("");
  const [noteText, setNoteText]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [lightbox, setLightbox]   = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(true);

  async function saveStatus() {
    if (newStatus === submission.status && !statusNote.trim()) { toast.info("No changes to save."); return; }
    setSaving(true);
    const { error } = await adminUpdateStatus(submission.id, newStatus, submission.status_history ?? [], statusNote.trim() || undefined);
    setSaving(false);
    if (error) { toast.error("Failed to update status.", { description: error }); return; }
    toast.success("Status updated!");
    const updated: Submission = {
      ...submission, status: newStatus,
      status_history: [...(submission.status_history ?? []), { status: newStatus, timestamp: new Date().toISOString(), ...(statusNote.trim() ? { note: statusNote.trim() } : {}) }],
    };
    setStatusNote(""); onUpdate(updated);
  }

  async function addNote() {
    if (!noteText.trim()) { toast.error("Note cannot be empty."); return; }
    setSaving(true);
    const { error } = await adminAddNote(submission.id, submission.admin_notes ?? [], noteText.trim());
    setSaving(false);
    if (error) { toast.error("Failed to add note.", { description: error }); return; }
    const updated: Submission = {
      ...submission,
      admin_notes: [...(submission.admin_notes ?? []), { text: noteText.trim(), timestamp: new Date().toISOString() }],
    };
    setNoteText(""); toast.success("Note added — visible to student on /track."); onUpdate(updated);
  }

  return (
    <>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <motion.aside key="dr" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 shrink-0">
          <div>
            <div className="font-mono text-xs text-flame font-bold">{submission.ticket_id}</div>
            <div className="font-bold text-base mt-0.5 truncate max-w-xs">{submission.subject}</div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${TYPE_COLOR[submission.type]}`}>{submission.type}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">{submission.category}</span>
            {submission.department && <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">{submission.department}</span>}
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_BG[submission.status]}`}>{STATUS_LABELS[submission.status]}</span>
          </div>

          {/* submitter info */}
          <div className="rounded-xl bg-gray-50 border p-4 text-sm space-y-1.5">
            <div className="font-semibold text-gray-700 mb-2">Submitter Info</div>
            {submission.is_anonymous
              ? <div className="text-gray-400 italic">Anonymous submission</div>
              : <>
                  {submission.name        && <div><span className="text-gray-500">Name: </span><span className="font-medium">{submission.name}</span></div>}
                  {submission.roll_number && <div><span className="text-gray-500">Roll No: </span><span className="font-medium">{submission.roll_number}</span></div>}
                </>}
            <div><span className="text-gray-500">Submitted: </span>{new Date(submission.created_at).toLocaleString("en-IN", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}</div>
            <div><span className="text-gray-500">Upvotes: </span>{submission.upvotes}</div>
          </div>

          {/* description */}
          <div>
            <div className="font-semibold text-sm text-gray-700 mb-2">Description</div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl border p-4">{submission.description}</p>
          </div>

          {/* images */}
          {(submission.image_urls?.length ?? 0) > 0 && (
            <div>
              <div className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-flame" /> Attached Images ({submission.image_urls.length})
              </div>
              <div className="flex flex-wrap gap-3">
                {submission.image_urls.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(url)}
                    className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-flame transition shadow-sm">
                    <img src={url} alt={`img ${i + 1}`} className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const ph = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (ph) ph.style.display = "flex";
                      }} />
                    <div style={{ display: "none" }} className="absolute inset-0 flex-col items-center justify-center bg-gray-100 text-gray-400 text-xs gap-1">
                      <ImageIcon className="h-5 w-5" /><span>img {i + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* status update */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">
            <div className="font-semibold text-sm text-blue-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Update Status
            </div>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as SubmissionStatus)}
              className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition">
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={2}
              placeholder="Optional note for this status change (visible to student)…"
              className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 transition resize-none" />
            <button onClick={saveStatus} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save Status
            </button>
          </div>

          {/* admin notes */}
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-3">
            <button onClick={() => setNotesOpen((v) => !v)} className="w-full flex items-center justify-between font-semibold text-sm text-amber-800">
              <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Admin Notes ({submission.admin_notes?.length ?? 0})</span>
              {notesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {notesOpen && (
              <>
                {(submission.admin_notes ?? []).length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {submission.admin_notes.map((n, i) => (
                      <div key={i} className="bg-white rounded-lg border border-amber-200 px-3 py-2.5">
                        <p className="text-sm text-gray-700">{n.text}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(n.timestamp).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3}
                  placeholder="Write a note for the student (visible on /track)…"
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 transition resize-none" />
                <button onClick={addNote} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Add Note
                </button>
              </>
            )}
          </div>

          {/* status history */}
          <div>
            <div className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" /> Status History
            </div>
            <div className="space-y-2">
              {(submission.status_history ?? []).map((e, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-flame mt-1.5 shrink-0" />
                  <div>
                    <span className="font-medium">{STATUS_LABELS[e.status as SubmissionStatus] ?? e.status}</span>
                    <span className="text-gray-400 ml-2 text-xs">
                      {new Date(e.timestamp).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                    </span>
                    {e.note && <div className="text-xs text-flame mt-0.5 italic">"{e.note}"</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 text-xl">✕</button>
        </div>
      )}
    </>
  );
}
