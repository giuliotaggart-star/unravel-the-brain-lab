import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { LabWorkflow, LAB_NEW, type LabState } from "@/components/unravel/lab/LabWorkflow";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { data, LAB, LUI } from "@/lib/unravel/data";
import { store, useReducedMotion } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "The lab: run a real investigation — Unravel" },
      { name: "description", content: "Three investigations at three levels. Commit to a hypothesis, then test it on real SEA-AD donor data." },
      { property: "og:title", content: "The lab: run a real investigation — Unravel" },
      { property: "og:description", content: "Guided, intermediate and advanced investigations on cortical-layer neurons, Sst neurons and microglia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabPage,
});

/** Difficulty colours: green, purple, red. Gold stays reserved for the competition. */
const TONES = [
  { card: "border-good/40 bg-good-soft/50", ring: "ring-good/25 border-good", ink: "text-good", bar: "bg-good", chip: "bg-good/15 text-good", solid: "bg-good" },
  { card: "border-peri/40 bg-peri-soft/50", ring: "ring-peri/25 border-peri", ink: "text-peri-ink", bar: "bg-peri", chip: "bg-peri/15 text-peri-ink", solid: "bg-peri" },
  { card: "border-coral/40 bg-coral-soft/50", ring: "ring-coral/25 border-coral", ink: "text-coral-ink", bar: "bg-coral", chip: "bg-coral/15 text-coral-ink", solid: "bg-coral" },
];

function LabPage() {
  const L = LAB();
  /** Difficulty is a design layer over the three investigations, in their data order. */
  const LEVELS: { level: string; diff: string; learn: string }[] = L.levels;
  const ui = LUI();
  const cases = data.caseStudies;
  const reduced = useReducedMotion();
  const [sel, setSel] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, LabState>>({});
  useEffect(() => {
    const all: Record<string, LabState> = {};
    cases.forEach((c) => (all[c.id] = { ...LAB_NEW(), ...(store.get<LabState>("lab." + c.id) || {}) }));
    setStates(all);
    const last = store.get<string>("lab.last");
    if (last && cases.some((c) => c.id === last)) setSel(last);
  }, [cases]);

  const open = (id: string | null) => {
    setSel(id);
    if (id) store.set("lab.last", id);
    else store.del("lab.last");
    if (id)
      requestAnimationFrame(() => document.getElementById("lab-workflow")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }));
  };
  const setSt = (id: string) => (fn: (s: LabState) => LabState) =>
    setStates((all) => {
      const next = fn(all[id] ?? LAB_NEW());
      store.set("lab." + id, next);
      return { ...all, [id]: next };
    });
  const idx = cases.findIndex((c) => c.id === sel);
  const cs = idx >= 0 ? cases[idx]! : null;

  return (
    <div>
      <ChapterOpener id="lab" heading={L.heading} intro={L.intro} />
      <PageWrap className="mt-12">
        <p className="kicker mb-4">{L.chooseLabel}</p>
        <ul className="grid gap-4 md:grid-cols-3">
          {cases.map((c, i) => {
            const st = states[c.id];
            const on = c.id === sel;
            const lv = LEVELS[i] ?? LEVELS[LEVELS.length - 1]!;
            const tone = TONES[Math.min(i, TONES.length - 1)]!;
            const done = !!(st?.finished && st.verdict);
            const started = !!st && st.max > 0;
            return (
              <li key={c.id}>
                <motion.button
                  type="button"
                  aria-pressed={on}
                  onClick={() => open(on ? null : c.id)}
                  whileHover={reduced ? {} : { y: -3 }}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                  className={cn(
                    "relative flex h-full w-full flex-col rounded-3xl border-[3px] text-left shadow-card transition-[box-shadow,background-color,opacity] duration-300",
                    sel ? "p-4" : "p-5 sm:p-6",
                    tone.card,
                    on ? cn("shadow-lift ring-4", tone.ring) : "hover:shadow-lift",
                    sel && !on && "opacity-70 hover:opacity-100",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className={cn("block font-mono text-xs font-semibold uppercase tracking-widest", tone.ink)}>{lv.level}</span>
                      <span className={cn("font-display-tight block font-semibold uppercase leading-none tracking-tight", tone.ink, sel ? "mt-1 text-3xl" : "mt-1.5 text-5xl")}>{lv.diff}</span>
                    </span>
                    <span className="flex shrink-0 items-end gap-1 pt-1" aria-hidden>
                      {[1, 2, 3].map((b) => (
                        <span key={b} className={cn("w-2 rounded-full", b <= i + 1 ? tone.bar : "bg-foreground/10")} style={{ height: 8 + b * 6 }} />
                      ))}
                    </span>
                  </span>
                  <span className={cn("font-medium leading-snug text-foreground", sel ? "mt-2 text-sm" : "mt-4 text-base")}>{c.plainTitle}</span>
                  {!sel && <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{lv.learn}</span>}
                  <span className={cn("flex flex-wrap items-center gap-2", sel ? "mt-3" : "mt-5")}>
                    {done ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-good-soft px-3 py-1.5 text-sm font-semibold text-good">
                        <Check className="size-4" /> {ui.verdictWords[st!.verdict!]}
                      </span>
                    ) : on ? (
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold", tone.chip)}>
                        {L.cardHere}{started ? ` · ${data.ui["step"]} ${st!.step + 1} / ${L.stepNames.length}` : ""}
                      </span>
                    ) : (
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold text-primary-foreground", tone.solid)}>
                        {started ? `${L.cardContinue} · ${data.ui["step"]} ${st!.step + 1} / ${L.stepNames.length}` : L.cardStart} <ArrowRight className="size-4" />
                      </span>
                    )}
                  </span>
                </motion.button>
              </li>
            );
          })}
        </ul>

        <div id="lab-workflow" className="scroll-mt-20">
          <AnimatePresence mode="wait">
            {cs && states[cs.id] && (
              <motion.div
                key={cs.id}
                initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : 12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mt-12"
              >
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="kicker">{LEVELS[idx]?.level} · {LEVELS[idx]?.diff}</p>
                    <h2 className="font-display-tight mt-1 text-3xl font-medium sm:text-4xl">{cs.plainTitle}</h2>
                    {L.levelUp?.[idx] && (
                      <p className="mt-3 max-w-2xl rounded-xl border border-peri/25 bg-peri-soft/60 px-4 py-2.5 text-sm leading-relaxed">
                        <strong className="text-peri-ink">{L.levelUpLabel}:</strong> {L.levelUp[idx]}
                      </p>
                    )}
                  </div>
                </div>
                <LabWorkflow
                  cs={cs}
                  index={idx}
                  total={cases.length}
                  st={states[cs.id]!}
                  setSt={setSt(cs.id)}
                  onClose={() => open(null)}
                  onNextCase={() => {
                    const nx = cases[idx + 1];
                    if (nx) open(nx.id);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageWrap>
      <ChapterPager id="lab" />
    </div>
  );
}
