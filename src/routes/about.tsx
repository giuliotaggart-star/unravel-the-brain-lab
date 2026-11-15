import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, Compass, GraduationCap, Sparkles, Trophy, Users } from "lucide-react";
import { PageWrap } from "@/components/unravel/Shell";
import { groups, steps } from "@/lib/unravel/chapters";
import { data, fill } from "@/lib/unravel/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Unravel — University research for A-level students" },
      { name: "description", content: "Unravel simulates a simplified university report using real Alzheimer's data, broken into digestible pieces." },
      { property: "og:title", content: "About Unravel" },
      { property: "og:description", content: "Bridging the gap between A-level and university research." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const SIDE_ICONS: Record<string, typeof Trophy> = { prize: Trophy, ucas: GraduationCap, teachers: Users };

function About() {
  const a = (data as any).about;
  const numbered = steps.filter((s) => !s.standalone);
  const solo = steps.find((s) => s.standalone);
  const side = groups.filter((g) => g.id !== "practice");
  const prize = side.find((g) => g.id === "prize");
  const rest = side.filter((g) => g.id !== "prize");
  return (
    <div>
      {/* Intro: crisp white, deep purple headline, lavender accents */}
      <div className="relative overflow-hidden border-b border-border bg-card">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-peri-soft blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-80 rounded-full bg-peri-soft/70 blur-3xl" aria-hidden />
        <PageWrap className="relative pb-16 pt-16 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl">
            <span className="kicker !text-peri-ink">{a.kicker}</span>
            <h1 className="font-display-tight mt-5 font-medium leading-[1.02] text-go-ink">
              <span className="block text-[clamp(2.6rem,6.5vw,5rem)]">{a.headingLead}</span>
              <span className="mt-2 block text-[clamp(1.6rem,3.6vw,2.75rem)] italic text-peri">{a.headingAccent}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{a.mission}</p>
            <ul className="mt-8 max-w-2xl space-y-3.5">
              {(a.points ?? []).map((p: string) => (
                <li key={p} className="flex items-start gap-3.5 text-[1.05rem] font-medium leading-relaxed">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-peri-soft text-peri-ink">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </PageWrap>
      </div>

      <PageWrap className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Core workflow */}
        <section aria-labelledby="path" className="rounded-3xl border border-peri/20 bg-peri-soft/50 p-6 sm:p-8">
          <h2 id="path" className="kicker !text-go-ink">{a.pathHeading}</h2>
          <ol className="mt-5 space-y-3">
            {numbered.map((st) => (
              <li key={st.n}>
                <Link to={st.to} className="flex items-center gap-4 rounded-2xl border border-peri/25 bg-card px-5 py-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-peri/50 hover:shadow-lift">
                  <span className="font-mono text-base font-semibold text-go-ink">{st.n}</span>
                  <span className="font-semibold">{st.name}</span>
                  <ArrowRight className="ml-auto size-4 text-peri-ink" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
          <Link to={numbered[0]!.to} className="group mt-6 flex items-center justify-between gap-4 rounded-2xl bg-go px-6 py-5 text-lg font-semibold text-go-foreground shadow-lift transition-all hover:-translate-y-0.5 hover:bg-go-ink">
            {a.cta}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </section>

        {/* Secondary sections */}
        <div className="space-y-6">
          {solo && (
            <Link to={solo.to} className="card-surface group flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-peri/40 hover:shadow-lift">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-peri-soft text-peri-ink"><Compass className="size-5" aria-hidden /></span>
              <span>
                <span className="block font-semibold">{solo.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{a.exploreNote}</span>
              </span>
            </Link>
          )}

          {prize && (
            <Link to={prize.to} className="gold-shine group relative flex items-start gap-4 overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card/60">
                <Sparkles className="glow-star size-5" aria-hidden />
              </span>
              <span>
                <span className="flex items-center gap-2 font-semibold text-gold-ink">
                  {prize.label}
                  <Trophy className="size-4" aria-hidden />
                </span>
                <span className="mt-1 block text-sm font-medium text-gold-ink/80">{fill((data as any).prize?.heading)}</span>
              </span>
              <ArrowRight className="ml-auto mt-1 size-4 shrink-0 text-gold-ink transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          )}

          <section aria-labelledby="skip">
            <h2 id="skip" className="kicker">{a.skipHeading}</h2>
            <ul className="mt-3 space-y-2">
              {rest.map((g) => {
                const Icon = SIDE_ICONS[g.id] ?? Users;
                return (
                  <li key={g.id}>
                    <Link to={g.to} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 font-semibold transition-colors hover:border-peri/40 hover:bg-peri-soft/40">
                      <Icon className="size-4 text-peri-ink" aria-hidden />
                      {g.label}
                      <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </PageWrap>
    </div>
  );
}
