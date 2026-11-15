import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, Compass, GraduationCap, Landmark, Monitor, School, Sparkles, Trophy, Users } from "lucide-react";
import { PageWrap } from "@/components/unravel/Shell";
import imperialLogo from "@/assets/imperial_logo.png.asset.json";
import { groups, steps } from "@/lib/unravel/chapters";
import { data, fill } from "@/lib/unravel/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Unravel — University research for A-level students" },
      { name: "description", content: "Unravel offers a simplified university report in biology, specifically bioinformatics." },
      { property: "og:title", content: "About Unravel" },
      { property: "og:description", content: "Bridging the gap between A-level and university research." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function BridgeGraphic({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4" aria-hidden>
      <div className="flex flex-col items-center gap-2">
        <span className="flex size-16 items-center justify-center rounded-2xl border border-peri/25 bg-card text-peri-ink shadow-card sm:size-20">
          <School className="size-7 sm:size-8" />
        </span>
        <span className="kicker !text-go-ink">{from}</span>
      </div>
      <svg viewBox="0 0 200 60" className="-mt-6 h-12 w-28 overflow-visible sm:w-44" fill="none">
        <motion.path
          d="M2 30 C 40 10, 70 50, 100 30 S 160 10, 198 30"
          stroke="var(--coral)" strokeWidth="3.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
        />
        <motion.circle cx="198" cy="30" r="4.5" fill="var(--coral)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }} />
      </svg>
      <div className="flex flex-col items-center gap-2">
        <motion.span initial={{ scale: 0.9, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2, type: "spring" }}
          className="flex size-16 items-center justify-center rounded-2xl bg-go text-go-foreground shadow-lift sm:size-20">
          <Landmark className="size-7 sm:size-8" />
        </motion.span>
        <span className="kicker !text-go-ink">{to}</span>
      </div>
    </div>
  );
}

function About() {
  const a = (data as any).about;
  const numbered = steps.filter((s) => !s.standalone);
  const solo = steps.find((s) => s.standalone);
  const prize = groups.find((g) => g.id === "prize");
  const ucas = groups.find((g) => g.id === "ucas");
  const teachers = groups.find((g) => g.id === "teachers");
  const practice = groups.find((g) => g.id === "practice");
  return (
    <div className="pb-20">
      <div className="relative overflow-hidden border-b border-border bg-card">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-peri-soft blur-3xl" aria-hidden />
        <PageWrap className="relative pb-12 pt-8 sm:pt-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <h1 className="font-display-tight font-medium leading-[1.05] text-go-ink">
              <span className="block text-[clamp(2.4rem,6vw,4.5rem)]">{a.headingLead}</span>
            </h1>
          </motion.div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-14">
            <div className="flex flex-col items-center gap-8">
              <BridgeGraphic from={a.graphicFrom} to={a.graphicTo} />
            </div>
            <div className="max-w-2xl">
              <p className="text-lg leading-relaxed sm:text-xl">
                {a.introLead} <strong className="font-semibold text-go-ink">{a.introTerm}</strong>.
              </p>
              <aside className="mt-5 rounded-2xl border-l-4 border-peri bg-peri-soft/60 px-5 py-4">
                <p className="font-display-tight text-xl font-semibold text-go-ink">{a.introTerm}</p>
                <p className="mt-1 text-[0.95rem] text-foreground">{a.termExplainer}</p>
              </aside>
              <p className="mt-6 text-lg leading-relaxed">{a.breakdown}</p>
              <h2 className="kicker mt-6 !text-go-ink">{a.benefitsHeading}</h2>
              <ul className="mt-3 space-y-2.5">
                {(a.points ?? []).map((p: string) => (
                  <li key={p} className="flex items-start gap-3 font-medium">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-peri-soft text-peri-ink">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-card">
                <img src={imperialLogo.url} alt="Imperial College London" className="h-8 w-auto shrink-0" />
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">
                    {a.builtByLead}{" "}
                    <Link to="/contact" className="text-go-ink underline decoration-go/50 underline-offset-2 transition-colors hover:decoration-go">
                      {a.builtByLink}
                    </Link>
                  </span>
                  <span className="block text-xs text-muted-foreground">{a.builtByOrg}</span>
                </span>
              </div>
            </div>
          </div>
        </PageWrap>
      </div>

      <PageWrap className="mt-14">
        <section aria-labelledby="tools">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-go text-go-foreground"><Monitor className="size-4" aria-hidden /></span>
            <h2 id="tools" className="font-display-tight text-3xl font-medium text-go-ink">{a.toolsHeading}</h2>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="relative rounded-3xl border-2 border-go bg-peri-soft/50 p-6 shadow-lift sm:p-7">
              <span className="absolute -top-3 left-6 rounded-full bg-go px-3 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-go-foreground">{a.startHere}</span>
              <h3 className="text-xl font-semibold text-go-ink">{practice?.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.pathHeading}</p>
              <ol className="mt-4 grid gap-2 sm:grid-cols-3">
                {numbered.map((st) => (
                  <li key={st.n}>
                    <Link to={st.to} className="flex h-full items-center gap-3 rounded-xl border border-peri/25 bg-card px-4 py-3 text-sm transition-all hover:-translate-y-0.5 hover:border-peri/50">
                      <span className="font-mono font-semibold text-go-ink">{st.n}</span>
                      <span className="font-semibold">{st.name}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <Link to={numbered[0]!.to} className="group mt-5 flex items-center justify-between gap-4 rounded-2xl bg-go px-6 py-4 text-lg font-semibold text-go-foreground transition-all hover:-translate-y-0.5 hover:bg-go-ink">
                {a.cta}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
            <div className="grid gap-5">
              {solo && (
                <Link to={solo.to} className="card-surface flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-peri/40">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-peri-soft text-peri-ink"><Compass className="size-5" aria-hidden /></span>
                  <span><span className="block font-semibold">{solo.name}</span><span className="mt-1 block text-sm text-muted-foreground">{a.exploreNote}</span></span>
                </Link>
              )}
              {ucas && (
                <Link to={ucas.to} className="card-surface flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-peri/40">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-peri-soft text-peri-ink"><GraduationCap className="size-5" aria-hidden /></span>
                  <span><span className="block font-semibold">{ucas.label}</span><span className="mt-1 block text-sm text-muted-foreground">{a.ucasNote}</span></span>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="skip" className="mt-14">
          <h2 id="skip" className="kicker">{a.skipHeading}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {prize && (
              <Link to={prize.to} className="gold-shine group flex items-center gap-4 rounded-2xl p-5 transition-all hover:-translate-y-0.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card/60"><Sparkles className="glow-star size-5" aria-hidden /></span>
                <span>
                  <span className="flex items-center gap-2 font-semibold text-gold-ink">{prize.label}<Trophy className="size-4" aria-hidden /></span>
                  <span className="mt-1 block text-sm font-medium text-gold-ink/80">{fill((data as any).prize?.heading)}</span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-gold-ink" aria-hidden />
              </Link>
            )}
            {teachers && (
              <Link to={teachers.to} className="card-surface flex items-center gap-4 p-5 font-semibold transition-colors hover:border-peri/40">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-peri-soft text-peri-ink"><Users className="size-5" aria-hidden /></span>
                {teachers.label}
                <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
              </Link>
            )}
          </div>
        </section>
      </PageWrap>
    </div>
  );
}
