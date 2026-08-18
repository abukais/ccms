import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Eye, Target, ShieldCheck, Sparkles } from "lucide-react";
import { PaperCard, SectionHeading } from "@/components/site/PaperCard";
import hero from "@/assets/hero-campus.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Portal | Chandrabhan Sharma College" },
      { name: "description", content: "A transparent, student-first initiative by CSC to listen, respond, and build a better campus." },
      { property: "og:title", content: "About CSC Portal" },
      { property: "og:description", content: "A transparent, student-first initiative by CSC." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:.6}}>
          <div className="hand text-3xl text-flame">About Us</div>
          <h1 className="font-display text-6xl font-black leading-[0.95]">Built by students,<br/>for <span className="text-flame">students.</span></h1>
          <p className="mt-5 text-muted-foreground max-w-lg leading-relaxed">The CSC Complain &amp; Suggest Portal is a transparent bridge between the students and the administration of Chandrabhan Sharma College — a paper world where every voice is heard, stamped, and acted upon.</p>
        </motion.div>
        <motion.img initial={{opacity:0,scale:.95,rotate:-2}} animate={{opacity:1,scale:1,rotate:-1}} transition={{duration:.7}} src={hero} alt="CSC campus paper cutout" width={1408} height={1104} loading="lazy" className="w-full h-auto rounded-2xl shadow-[var(--shadow-paper-lift)]"/>
      </div>
      <div className="mx-auto max-w-6xl px-6 mt-24">
        <SectionHeading hand="Our Beliefs" title={<>What drives <span className="text-flame">this portal</span></>} />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Target className="h-6 w-6"/>, title: "Mission", body: "Give every student a fast, confidential way to raise issues and see them resolved." },
            { icon: <Eye className="h-6 w-6"/>, title: "Vision", body: "A campus where transparency is the default and improvement is continuous." },
            { icon: <ShieldCheck className="h-6 w-6"/>, title: "Transparency", body: "Public suggestions, live timelines and honest status — no black boxes." },
          ].map((c, i) => (
            <PaperCard key={c.title} tilt={i === 1 ? 0 : (i === 0 ? -1 : 1)} tape={i===1?"both":"none"} className="p-8">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-flame/15 text-flame mb-4">{c.icon}</div>
              <div className="font-bold text-xl mb-2">{c.title}</div>
              <p className="text-sm text-ink/70 leading-relaxed">{c.body}</p>
            </PaperCard>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 mt-24">
        <PaperCard tape="left" className="p-10 md:p-14 flex flex-wrap items-center justify-between gap-6">
          <div>
            <Sparkles className="h-6 w-6 text-flame mb-2"/>
            <div className="font-display text-3xl font-black">Have something to say?</div>
            <div className="text-muted-foreground">Your paper voice is one submission away.</div>
          </div>
          <a href="/submit" className="inline-flex items-center gap-2 rounded-full bg-flame text-white px-6 py-3 text-sm font-semibold hover:-translate-y-0.5 transition">Submit now →</a>
        </PaperCard>
      </div>
    </section>
  );
}