import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { PaperCard, InkButton, SectionHeading } from "@/components/site/PaperCard";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact CSC Portal" },
      { name: "description", content: "Reach the Chandrabhan Sharma College grievance team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in name, email and message.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert([form]);
    setSending(false);
    if (error) {
      toast.error("Could not send message. Please try again.");
      return;
    }
    toast.success("Letter sent!", { description: "We'll get back to you soon." });
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading hand="Say hi" title={<>Send us a <span className="text-flame">paper letter</span></>} />
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <PaperCard tape="both" className="p-8 md:p-10">
              <div className="hand text-2xl text-flame">Dear CSC,</div>
              <form className="mt-4 space-y-5" onSubmit={handleSend}>
                <div className="grid md:grid-cols-2 gap-5">
                  <input value={form.name} onChange={set("name")} placeholder="Your name"
                    className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 px-4 py-3 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition" />
                  <input value={form.email} onChange={set("email")} placeholder="Email address" type="email"
                    className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 px-4 py-3 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition" />
                </div>
                <input value={form.subject} onChange={set("subject")} placeholder="Subject"
                  className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 px-4 py-3 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition" />
                <textarea value={form.message} onChange={set("message")} rows={7} placeholder="Write your message…"
                  className="w-full rounded-xl border border-ink/15 bg-paper-warm/50 px-4 py-3 outline-none focus:border-flame focus:ring-4 focus:ring-flame/15 transition resize-none" />
                <div className="flex items-center justify-between">
                  <div className="hand text-xl text-ink/60">— Yours truly.</div>
                  <InkButton type="submit" onClick={() => {}}>
                    {sending ? "Sending…" : <><Send className="h-4 w-4" /> Send letter</>}
                  </InkButton>
                </div>
              </form>
            </PaperCard>
          </motion.div>

          <div className="space-y-5">
            {[
              { icon: <MapPin className="h-5 w-5" />, k: "Visit", v: "CSC Campus, Powai, Mumbai, India" },
              { icon: <Mail className="h-5 w-5" />, k: "Email", v: "voice@csc.edu.in" },
              { icon: <Phone className="h-5 w-5" />, k: "Phone", v: "+91 22 0000 0000" },
            ].map((c, i) => (
              <PaperCard key={c.k} tilt={i % 2 ? 0.8 : -0.8} className="p-5 flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-flame/15 text-flame">{c.icon}</div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.k}</div>
                  <div className="font-semibold">{c.v}</div>
                </div>
              </PaperCard>
            ))}
            <PaperCard tape="right" className="p-2 overflow-hidden">
              <div className="relative rounded-lg overflow-hidden">
                <iframe title="CSC map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=72.905%2C19.115%2C72.925%2C19.130&layer=mapnik"
                  className="w-full h-56 border-0 grayscale-[0.3] saturate-75" />
              </div>
            </PaperCard>
          </div>
        </div>
      </div>
    </section>
  );
}
