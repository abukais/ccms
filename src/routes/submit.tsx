import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useRef } from "react";
import { Upload, Send, FileText, User, Hash, BookOpen, Tag, AlertCircle, X, Image as ImageIcon } from "lucide-react";
import { PaperCard, InkButton } from "@/components/site/PaperCard";
import { StarDoodle } from "@/components/site/Doodles";
import { toast } from "sonner";
import { createSubmission } from "@/lib/api";
import { SUPABASE_CONFIGURED } from "@/lib/supabase";
import type { SubmissionCategory, SubmissionType, Submission } from "@/lib/supabase";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [{ title: "Submit a Complaint or Suggestion | CSC" }] }),
  component: SubmitPage,
});

const CATEGORIES: SubmissionCategory[] = ["Infrastructure", "Academics", "Hostel", "Cafeteria", "Faculty", "Events", "Other"];
const MAX_IMAGES = 5;
const MAX_MB = 5;

function SubmitPage() {
  const navigate = useNavigate();
  const [anon, setAnon]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType]           = useState<SubmissionType>("complaint");
  const [images, setImages]       = useState<File[]>([]);
  const [previews, setPreviews]   = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", roll_number: "", department: "", category: "" as SubmissionCategory | "", subject: "", description: "" });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => {
      if (f.size > MAX_MB * 1024 * 1024) { toast.error(`${f.name} exceeds ${MAX_MB}MB`); return false; }
      if (!f.type.startsWith("image/"))  { toast.error(`${f.name} is not an image`);    return false; }
      return true;
    });
    const next = [...images, ...valid].slice(0, MAX_IMAGES);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(i: number) {
    const next = images.filter((_, idx) => idx !== i);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category)           { toast.error("Please choose a category.");              return; }
    if (!form.subject.trim())     { toast.error("Please add a subject.");                  return; }
    if (!form.description.trim()) { toast.error("Please describe your complaint/suggestion."); return; }

    if (!SUPABASE_CONFIGURED) {
      toast.error("Database not configured", {
        description: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, then restart the server.",
        duration: 8000,
      });
      return;
    }

    setSubmitting(true);
    let data: Submission | null = null;
    let error: string | null = null;
    try {
      const res = await createSubmission({
        type,
        category:     form.category as SubmissionCategory,
        subject:      form.subject,
        description:  form.description,
        name:         form.name,
        roll_number:  form.roll_number,
        department:   form.department,
        is_anonymous: anon,
        images,
      });
      data  = res.data;
      error = res.error;
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown network error";
    }
    setSubmitting(false);

    if (error || !data) {
      const isNetwork = (error ?? "").toLowerCase().includes("fetch") || (error ?? "").includes("NetworkError");
      toast.error(isNetwork ? "Cannot reach the database" : "Submission failed", {
        description: isNetwork
          ? "Check that VITE_SUPABASE_URL in your .env is correct and restart the server."
          : (error ?? "Unknown error"),
        duration: 8000,
      });
      return;
    }

    const uploaded = data.image_urls?.length ?? 0;
    if (images.length > 0 && uploaded < images.length) {
      toast.warning(`${images.length - uploaded} image(s) failed to upload`, {
        description: "The submission was saved. Check the Supabase storage bucket is public.",
      });
    }

    toast.success("Stamped & received!", {
      description: `Ticket ${data.ticket_id} created. Redirecting to track page…`,
      duration: 5000,
    });
    navigate({ to: "/track", search: { id: data.ticket_id } });
  };

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-[1fr_1.45fr] gap-14 items-start">

        {/* ── left panel ── */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:sticky lg:top-28">
          <div className="hand text-3xl text-flame">Submit a</div>
          <h1 className="font-display text-6xl font-black leading-[0.95]">
            Complaint <span className="text-flame">/</span><br />Suggestion
          </h1>
          <p className="mt-5 text-muted-foreground max-w-md">
            Tell us what's on your mind. Anonymous or signed — either way we listen.
          </p>
          <div className="mt-6 inline-flex gap-1 p-1 rounded-full bg-paper-warm border">
            {(["complaint", "suggestion"] as SubmissionType[]).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition ${type === t ? "bg-flame text-white" : "text-ink/70 hover:text-ink"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {["📎 Attach up to 5 images as evidence", "🔒 Toggle anonymous to hide your identity", "🎟️ You'll get a ticket ID to track progress"].map((tip) => (
              <div key={tip} className="text-sm text-ink/70">{tip}</div>
            ))}
          </div>
        </motion.div>

        {/* ── form ── */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }} onSubmit={handleSubmit} className="relative">
          <PaperCard tape="both" className="p-8 md:p-10 space-y-6">
            <StarDoodle className="absolute -top-6 -right-4 w-10 text-flame" />

            {/* identity */}
            <Field icon={<User className="h-4 w-4" />} label="Full Name" placeholder="e.g. Aarav Sharma" value={form.name} onChange={set("name")} disabled={anon} />
            <div className="grid md:grid-cols-2 gap-6">
              <Field icon={<Hash className="h-4 w-4" />} label="Roll Number" placeholder="e.g. CSC/BSc/2026/017" value={form.roll_number} onChange={set("roll_number")} disabled={anon} />
              <Field icon={<BookOpen className="h-4 w-4" />} label="Department" placeholder="e.g. Computer Science" value={form.department} onChange={set("department")} />
            </div>

            {/* category + subject */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold flex items-center gap-2 mb-2"><Tag className="h-4 w-4" /> Category <span className="text-flame">*</span></label>
                <select value={form.category} onChange={set("category")}
                  className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 px-4 py-3 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition">
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field icon={<FileText className="h-4 w-4" />} label="Subject" placeholder="Short one-line summary" value={form.subject} onChange={set("subject")} required />
            </div>

            {/* description */}
            <div>
              <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" /> Description <span className="text-flame">*</span>
              </label>
              <textarea required rows={5} value={form.description} onChange={set("description")}
                placeholder={`Describe your ${type} in detail…`}
                className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 px-4 py-3 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition resize-none" />
            </div>

            {/* image upload */}
            <div>
              <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" /> Attach Images
                <span className="text-muted-foreground font-normal">(optional · max {MAX_IMAGES})</span>
              </label>
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-ink/15">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length < MAX_IMAGES && (
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/25 bg-paper-warm/40 px-6 py-6 cursor-pointer hover:border-flame hover:bg-flame/5 transition">
                  <Upload className="h-6 w-6 text-flame" />
                  <div className="text-sm font-medium">Click to upload images</div>
                  <div className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max {MAX_MB}MB · {MAX_IMAGES - images.length} remaining</div>
                  <input ref={fileRef} type="file" className="hidden" accept="image/*" multiple onChange={handleImageAdd} />
                </label>
              )}
            </div>

            {/* anonymous toggle */}
            <label className="flex items-center gap-3 select-none cursor-pointer">
              <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${anon ? "bg-flame" : "bg-ink/20"}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${anon ? "translate-x-5" : "translate-x-0.5"}`} />
                <input type="checkbox" className="sr-only" checked={anon} onChange={() => setAnon((v) => !v)} />
              </span>
              <span className="text-sm">I want to remain <strong>anonymous</strong></span>
            </label>

            {anon && (
              <div className="flex items-center gap-2 rounded-xl bg-flame/10 border border-flame/30 px-4 py-3 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-flame" />
                Your name and roll number will not be stored or shown to reviewers.
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">Your information is 100% confidential.</div>
              <InkButton type="submit">
                {submitting ? "Submitting…" : <><Send className="h-4 w-4" /> Stamp &amp; Submit</>}
              </InkButton>
            </div>
          </PaperCard>
        </motion.form>
      </div>
    </section>
  );
}

function Field({ icon, label, placeholder, disabled, value, onChange, required }: {
  icon: React.ReactNode; label: string; placeholder: string;
  disabled?: boolean; value: string; required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold flex items-center gap-2 mb-2">
        {icon} {label} {required && <span className="text-flame">*</span>}
      </label>
      <input disabled={disabled} placeholder={placeholder} value={value} onChange={onChange}
        className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 px-4 py-3 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 disabled:opacity-50 transition" />
    </div>
  );
}
