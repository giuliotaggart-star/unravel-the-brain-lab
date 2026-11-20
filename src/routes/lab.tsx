import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { LabWorkflow, LAB_NEW, type LabState } from "@/components/unravel/lab/LabWorkflow";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { cellColourVar, data, LAB, LUI } from "@/lib/unravel/data";
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

/** Difficulty is a design layer over the three investigations, in their data order. */
const LEVELS = [
  { level: "Level 1", diff: "Easy", mode: "Guided", bars: 1 },
  { level: "Level 2", diff: "Medium", mode: "Intermediate", bars: 2 },
  { level: "Level 3", diff: "Difficult", mode: "Advanced", bars: 3 },
];

function LabPage() {
  const L = LAB();
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
            const col = cellColourVar(c.views[0]!.cellType);
            return (
              <li key={c.id}>
                <motion.button
                  type="button"
                  aria-pressed={on}
                  onClick={() => open(on ? null : c.id)}
                  whileHover={reduced ? {} : { y: -3 }}
                  className={cn(
                    "card-surface relative flex h-full w-full flex-col overflow-hidden p-6 text-left transition-[box-shadow,border-color] duration-300",
                    on ? "border-coral shadow-lift ring-2 ring-coral/25" : "hover:shadow-lift",
                    sel && !on && "opacity-75 hover:opacity-100",
                  )}
                >
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: col }} />
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-foreground">{lv.level}</span>
                      <span className="text-sm font-semibold">{lv.diff}</span>
                      <span className="text-sm text-muted-foreground">· {lv.mode}</span>
                    </span>
                    <span className="flex gap-0.5" aria-hidden>
                      {[1, 2, 3].map((b) => (
                        <span key={b} className={cn("w-1.5 rounded-full", b <= lv.bars ? "bg-coral" : "bg-muted")} style={{ height: 6 + b * 4 }} />
                      ))}
                    </span>
                  </span>
                  <span className="mt-6 flex items-center gap-3">
                    <span className="font-display-tight text-4xl font-medium text-muted-foreground/60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="size-3 rounded-full" style={{ background: col }} aria-hidden />
                  </span>
                  <span className="font-display-tight mt-2 text-2xl font-medium leading-tight">{c.plainTitle}</span>
                  <span className="mt-1 font-mono text-xs tracking-wide text-muted-foreground">{c.title}</span>
                  <span className="mt-4 flex-1 leading-relaxed text-foreground/80">{c.pickerLine}</span>
                  <span className="mt-5 flex items-center justify-between">
                    {st?.finished && st.verdict ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-good-soft px-3 py-1 text-xs font-semibold text-good">
                        <Check className="size-3.5" /> {ui.verdictWords[st.verdict]}
                      </span>
                    ) : st && st.max > 0 ? (
                      <span className="font-mono text-xs text-muted-foreground">{`${data.ui["step"]} ${st.step + 1} / ${L.stepNames.length}`}</span>
                    ) : (
                      <span />
                    )}
                    <span className={cn("inline-flex size-8 items-center justify-center rounded-full border transition-colors", on ? "border-coral bg-coral text-primary-foreground" : "border-border")} aria-hidden>
                      {on ? <Check className="size-4" /> : "→"}
                    </span>
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
