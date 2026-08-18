import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, HelpCircle } from "lucide-react";
import { SectionHeading } from "@/components/site/PaperCard";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | CSC" },
      { name: "description", content: "Answers about submitting, tracking, and resolving complaints at CSC." },
      { property: "og:title", content: "FAQs | CSC" },
      { property: "og:description", content: "Everything you want to know about the CSC Complain & Suggest Portal." },
    ],
  }),
  component: FAQPage,
});

const faqs = [
  { q: "How can I submit a complaint or suggestion?", a: "Head to the Submit page, fill out the paper form, attach any evidence, and stamp it in. You'll get a ticket ID instantly." },
  { q: "Is my identity kept confidential?", a: "Yes. Enable the Anonymous toggle when submitting — your name and roll number will never be visible to reviewers." },
  { q: "How can I track my complaint?", a: "Visit the Track page and enter your ticket ID or the email you used when submitting. The timeline unfolds automatically." },
  { q: "How long does it take to resolve a complaint?", a: "Most complaints move to Resolved within 5–7 working days depending on the category and department load." },
  { q: "Can I attach files or images?", a: "Absolutely. Every submission accepts PDF, JPG, and PNG attachments up to 5MB." },
  { q: "Can I vote on other students' suggestions?", a: "Yes — hop over to the Suggestions page and upvote the ideas you'd like the college to prioritise." },
];

function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading hand="Answers" title={<>Frequently <span className="text-flame">Asked</span></>} />
        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div key={f.q} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }} className="paper-card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 text-left px-6 py-5">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-flame shrink-0"/>
                    <span className="font-semibold text-lg">{f.q}</span>
                  </div>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25 }} className="grid h-8 w-8 place-items-center rounded-full bg-flame/15 text-flame shrink-0">
                    <Plus className="h-4 w-4"/>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.9, 0.2, 1] }} className="overflow-hidden">
                      <div className="px-6 pb-5 pl-14 text-ink/75 leading-relaxed">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-14 paper-card p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="hand text-2xl text-flame">Still curious?</div>
            <div className="font-bold text-xl">Reach our support team.</div>
          </div>
          <a href="/contact" className="inline-flex items-center gap-2 rounded-full bg-ink text-background px-5 py-3 text-sm font-semibold hover:-translate-y-0.5 transition">Contact us →</a>
        </div>
      </div>
    </section>
  );
}