import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/unravel/Shell";
import { chapters } from "@/lib/unravel/chapters";
import { data, num } from "@/lib/unravel/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unravel — A taste of university science, starting with dementia" },
      { name: "description", content: "A free research simulation for UK A-level students: real SEA-AD brain-cell data from 84 donors, a poll, myth busting and a hands-on lab." },
      { property: "og:title", content: "Unravel — A taste of university science" },
      { property: "og:description", content: "Run real investigations on donor-level brain-cell data from the Seattle Alzheimer's Disease Brain Cell Atlas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function HeroThread() {
  return (
    <svg viewBox="0 0 600 120" className="h-auto w-full max-w-xl" aria-hidden>
      <motion.path
        d="M4 70 C 120 70, 180 70, 240 58 C 292 46, 300 14, 272 14 C 244 14, 246 62, 300 70 C 360 78, 420 70, 596 70"
        fill="none"
        stroke="var(--coral)"
        strokeWidth={5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
      />
      <motion.circle cx={596} cy={70} r={6} fill="var(--coral)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} />
    </svg>
  );
}

function Home() {
  const m = data.meta;
  const facts = [
    { v: num(m.donorTotal.value, 0), u: m.donorTotal.unit },
    { v: num(m.cellsTotal.value, 0), u: m.cellsTotal.unit },
    { v: m.region, u: m.dataset.split("—")[0]?.trim() },
  ];
  const rest = chapters.slice(1);
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--coral)_14%,transparent),transparent)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center text-center">
            <span className="mb-6 flex items-center gap-3">
              <span className="flex h-8 items-center rounded-lg border border-coral/40 bg-card px-2 font-mono text-sm text-coral-ink">01</span>
              <span className="kicker">{chapters[0]!.name}</span>
            </span>
            <h1 className="leading-[0.85]">
              <Brand className="block text-[clamp(4.5rem,17vw,12.5rem)]" />
            </h1>
            <HeroThread />
            <p className="font-display-tight mt-6 max-w-2xl text-[clamp(1.5rem,3.4vw,2.4rem)] font-normal leading-tight text-foreground">{data.hero["tagline"]}</p>
            <Button asChild variant="coral" size="pill" className="mt-10 h-12 px-8 text-base">
              <Link to="/poll">
                {data.hero["cta"]} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-16 grid max-w-4xl gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-card sm:grid-cols-3"
          >
            {facts.map((f) => (
              <div key={f.u} className="flex flex-col bg-card px-6 py-5 text-center">
                <dt className="kicker order-2 mt-1">{f.u}</dt>
                <dd className="font-display-tight text-2xl font-medium tabular-nums text-foreground sm:text-3xl">{f.v}</dd>
              </div>
            ))}
          </motion.dl>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm text-muted-foreground">
            {m.source} · {m.citation}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label={data.ui["sections"]}>
        <p className="kicker mb-5">{data.ui["sections"]}</p>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((c, i) => (
            <motion.li key={c.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: i * 0.05 }}>
              <Link to={c.to} className="card-surface group flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:border-peri/30 hover:shadow-lift">
                <span className="flex items-center justify-between">
                  <span className="font-mono text-sm text-coral-ink">{c.n}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-coral" aria-hidden />
                </span>
                <span className="font-display-tight mt-8 text-2xl font-medium leading-tight">{c.name}</span>
                {c.line && <span className="mt-1.5 text-sm text-muted-foreground">{c.line}</span>}
              </Link>
            </motion.li>
          ))}
        </ol>
      </section>
    </div>
  );
}
