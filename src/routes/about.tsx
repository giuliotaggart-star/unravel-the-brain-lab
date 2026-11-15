import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Compass, FileText, GraduationCap, Trophy, Users } from "lucide-react";
import { PageWrap } from "@/components/unravel/Shell";
import { groups, steps } from "@/lib/unravel/chapters";
import { data } from "@/lib/unravel/data";
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

const ICONS = [FileText, BarChart3];
const SIDE_ICONS: Record<string, typeof Trophy> = { prize: Trophy, ucas: GraduationCap, teachers: Users };

function About() {
  const a = (data as any).about;
  const numbered = steps.filter((s) => !s.standalone);
  const solo = steps.find((s) => s.standalone);
  const side = groups.filter((g) => g.id !== "practice");
  return (
    <div>
      <div className="relative overflow-hidden border-b border-border bg-surface">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <PageWrap className="relative pb-16 pt-16 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl">
            <span className="kicker">{a.kicker}</span>
            <h1 className="font-display-tight mt-5 font-medium leading-[1.02]">
              <span className="block text-[clamp(2.6rem,6.5vw,5rem)]">{a.headingLead}</span>
              <span className="mt-2 block text-[clamp(1.6rem,3.6vw,2.75rem)] italic text-go-ink">{a.headingAccent}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{a.mission}</p>
          </motion.div>
          <ul className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {a.cards.map((c: any, i: number) => {
              const Icon = ICONS[i] ?? FileText;
              return (
                <li key={c.title} className="card-surface flex gap-4 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-peri-soft text-peri-ink"><Icon className="size-5" aria-hidden /></span>
                  <span>
                    <span className="block font-semibold">{c.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{c.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </PageWrap>
      </div>

      <PageWrap className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="path" className="rounded-3xl border border-go/25 bg-go-soft p-6 sm:p-8">
          <h2 id="path" className="kicker !text-go-ink">{a.pathHeading}</h2>
          <ol className="mt-5 space-y-2">
            {numbered.map((st) => (
              <li key={st.n}>
                <Link to={st.to} className="flex items-center gap-4 rounded-xl bg-card px-4 py-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
                  <span className="font-mono text-sm text-go-ink">{st.n}</span>
                  <span className="font-semibold">{st.name}</span>
                  <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
          <Link to={numbered[0]!.to} className="group mt-6 flex items-center justify-between gap-4 rounded-2xl bg-go px-6 py-5 text-lg font-semibold text-go-foreground shadow-lift transition-all hover:-translate-y-0.5 hover:bg-go-ink">
            {a.cta}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </section>

        <div className="space-y-6">
          {solo && (
            <Link to={solo.to} className="card-surface group flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-peri/40 hover:shadow-lift">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-peri text-primary-foreground"><Compass className="size-5" aria-hidden /></span>
              <span>
                <span className="block font-semibold">{solo.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{a.exploreNote}</span>
              </span>
            </Link>
          )}
          <section aria-labelledby="skip">
            <h2 id="skip" className="kicker">{a.skipHeading}</h2>
            <ul className="mt-3 space-y-2">
              {side.map((g) => {
                const Icon = SIDE_ICONS[g.id] ?? Users;
                const gold = g.id === "prize";
                return (
                  <li key={g.id}>
                    <Link to={g.to} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 font-semibold transition-colors", gold ? "border-gold/60 bg-gold-soft hover:bg-gold/25" : "border-border bg-card hover:bg-muted")}>
                      <Icon className={cn("size-4", gold ? "text-gold-ink" : "text-muted-foreground")} aria-hidden />
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
