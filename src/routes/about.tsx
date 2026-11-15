import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, FileText, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { data } from "@/lib/unravel/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Unravel — University research for A-level minds" },
      { name: "description", content: "Unravel breaks real Alzheimer's and dementia research into digestible pieces: bioinformatics, data analysis and academic writing." },
      { property: "og:title", content: "About Unravel" },
      { property: "og:description", content: "Bridging the gap between A-level and university research." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const ICONS = [FileText, BarChart3, Trophy];

function About() {
  const a = (data as any).about;
  return (
    <div>
      <div className="relative overflow-hidden border-b border-border bg-surface">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <PageWrap className="relative pb-16 pt-16 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl">
            <span className="kicker">{a.kicker}</span>
            <h1 className="font-display-tight mt-5 text-[clamp(2.4rem,6vw,4.75rem)] font-medium leading-[1]">{a.heading}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{a.mission}</p>
          </motion.div>
        </PageWrap>
      </div>
      <PageWrap className="mt-14">
        <ul className="grid gap-5 md:grid-cols-3">
          {a.cards.map((c: any, i: number) => {
            const Icon = ICONS[i] ?? FileText;
            return (
              <motion.li key={c.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }} className="card-surface flex flex-col p-7">
                <span className="flex size-11 items-center justify-center rounded-xl bg-peri-soft text-peri-ink"><Icon className="size-5" aria-hidden /></span>
                <h2 className="font-display-tight mt-6 text-2xl font-medium">{c.title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{c.body}</p>
              </motion.li>
            );
          })}
        </ul>
        <div className="mt-12 flex justify-center">
          <Button asChild variant="coral" size="pill" className="h-12 px-8 text-base">
            <Link to="/poll">{a.cta} <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </PageWrap>
      <ChapterPager id="about" />
    </div>
  );
}
