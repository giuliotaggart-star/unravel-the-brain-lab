import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, HelpCircle, Lightbulb, Lock, PenLine, Save, Table2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DonorPlot, StatsTable } from "@/components/unravel/DonorPlot";
import { Segmented } from "@/components/unravel/InsightGraphics";
import { GlossaryScope, Rich } from "@/components/unravel/Rich";
import { NumberedBlock } from "@/components/unravel/Shell";
import { cellColourVar, data, fill, LAB, LUI, num, shortUnitSafe } from "@/lib/unravel/data";
import { foldWords, labAbstract, labResample, labStats, labVars, labVerdictKey, type Hyp, type LabStats, type VerdictKey } from "@/lib/unravel/stats";
import { store, useReducedMotion } from "@/lib/unravel/store";
import type { CaseStudy, ClaimBlank } from "@/lib/unravel/types";
import { cn } from "@/lib/utils";
import { IntroVisual, PredictionIndicator, StatsIllustration } from "./visuals";

export type CheckMode = "none" | "age" | "sex" | "apoe" | "resample";
export interface LabState {
  step: number;
  max: number;
  hyp: Hyp | null;
  locked: boolean;
  methodsPick: string | null;
  methodsOk: boolean;
  revealed: boolean;
  verdict: VerdictKey | null;
  second: boolean;
  check: CheckMode;
  claim: Record<string, string>;
  limits: { sel: number[]; checked: boolean };
  finished: boolean;
  saved: boolean;
}
export const LAB_NEW = (): LabState => ({
  step: 0, max: 0, hyp: null, locked: false, methodsPick: null, methodsOk: false, revealed: false, verdict: null,
  second: false, check: "none", claim: {}, limits: { sel: [], checked: false }, finished: false, saved: false,
});

const CONF_KEY: Record<Exclude<CheckMode, "none" | "resample">, string> = { age: "age", sex: "sex", apoe: "apoe4" };
const TINTS = ["var(--coral)", "var(--peri)", "var(--cell-sst)"];

/* ---------- readout strip: the two medians, the change in words, the donors compared, the evidence meter ---------- */
function Readouts({ S, show }: { S: LabStats; show: boolean }) {
  const ui = LUI();
  const unit = shortUnitSafe(S.Q.unit);
  const lit = { tooFew: 0, none: 1, suggestive: 2, detected: 3 }[S.evidence];
  const cells: { label: string; value: ReactNode }[] = [
    { label: fill(ui.readout.first, { firstGroup: S.first.name }), value: <>{num(S.first.median, S.Q.dec)}<small className="ml-1 text-sm font-medium text-muted-foreground">{unit}</small></> },
    { label: fill(ui.readout.last, { lastGroup: S.last.name }), value: <>{num(S.last.median, S.Q.dec)}<small className="ml-1 text-sm font-medium text-muted-foreground">{unit}</small></> },
    { label: ui.readout.change, value: <span className="text-lg leading-tight">{foldWords(S.Q.fold)}</span> },
    { label: ui.readout.donors, value: String(S.first.n + S.last.n) },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-5">
      {cells.map((c, i) => (
        <motion.div key={c.label} className="bg-card p-3.5" initial={false} animate={{ opacity: show ? 1 : 0.35 }} transition={{ delay: show ? 0.15 * i : 0 }}>
          <p className="kicker text-[0.65rem] leading-tight">{c.label}</p>
          <p className="font-display-tight mt-1.5 text-2xl font-medium tabular-nums">{show ? c.value : "–"}</p>
        </motion.div>
      ))}
      <motion.div className="col-span-2 bg-card p-3.5 sm:col-span-1" initial={false} animate={{ opacity: show ? 1 : 0.35 }} transition={{ delay: show ? 0.6 : 0 }}>
        <p className="kicker text-[0.65rem]">{ui.evidence.label}</p>
        <div className="mt-2 flex items-center gap-1" role="img" aria-label={show ? ui.evidence[S.evidence] : ""}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn("h-2 flex-1 rounded-full transition-colors duration-500", show && i < lit ? (lit === 3 ? "bg-coral" : "bg-peri") : "bg-muted")} style={{ transitionDelay: `${700 + i * 120}ms` }} />
          ))}
        </div>
        <p className="mt-1.5 text-sm font-semibold leading-tight">{show ? ui.evidence[S.evidence] : ""}</p>
        <p className="font-mono text-xs text-muted-foreground">p {show ? (S.evidence === "tooFew" ? "-" : S.pText) : ""}</p>
      </motion.div>
    </div>
  );
}

function ReadingBlock({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Feedback({ good, children }: { good: boolean; children: ReactNode }) {
  return (
    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-sm", good ? "bg-good-soft text-good" : "bg-coral-soft text-coral-ink")}>
      {good && <Check className="mt-0.5 size-4 shrink-0" />}
      <span>{children}</span>
    </motion.p>
  );
}

export function LabWorkflow({ cs, index, total, st, setSt, onClose, onNextCase }: {
  cs: CaseStudy;
  index: number;
  total: number;
  st: LabState;
  setSt: (fn: (s: LabState) => LabState) => void;
  onClose: () => void;
  onNextCase: () => void;
}) {
  const ui = LUI();
  const L = LAB();
  const names: string[] = L.stepNames;
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const top = useRef<HTMLDivElement>(null);
  const S = useMemo(() => labStats(cs, 0), [cs]);
  const S2 = useMemo(() => (cs.views.length > 1 ? labStats(cs, 1) : null), [cs]);
  const two = !!S2;
  const verdictKey = labVerdictKey(st.hyp, S.p, S.dir);
  const vars = labVars(cs, S, st.hyp);
  const i = st.step;
  const isLast = index === total - 1;
  const easy = index === 0;
  /** 0 easy, 1 medium, 2 hard: extras appear as the level rises; writing help fades. */
  const level = Math.min(index, 2);
  /** Easy level: keep the right answer plus one wrong one, in their original order. */
  const trim = (opts: string[], correct: string) => (easy ? opts.filter((o) => o === correct || o === opts.find((x) => x !== correct)) : opts);
  const [table, setTable] = useState(false);
  const [showVerdict, setShowVerdict] = useState(st.revealed);
  const [lockWarn, setLockWarn] = useState(false);
  useEffect(() => setTable(false), [i]);

  const goStep = (k: number) => {
    if (k < 0 || k > st.max || k >= names.length) return;
    setSt((s) => ({ ...s, step: k }));
  };
  const next = () => setSt((s) => ({ ...s, step: Math.min(names.length - 1, s.step + 1), max: Math.max(s.max, Math.min(names.length - 1, s.step + 1)) }));
  const back = () => (i === 0 ? onClose() : setSt((s) => ({ ...s, step: s.step - 1 })));
  useEffect(() => {
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  // Results: the first reveal plays, then the verdict follows from the test and is recorded.
  useEffect(() => {
    if (i !== 3) return;
    if (st.revealed) { setShowVerdict(true); return; }
    const t = window.setTimeout(() => {
      setShowVerdict(true);
      setSt((s) => ({ ...s, revealed: true, verdict: labVerdictKey(s.hyp, S.p, S.dir) }));
    }, reduced ? 0 : 2600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  /* ---------- the plot panel, shared by steps 2, 4 and 5 ---------- */
  const viewS = i === 3 && st.second && S2 ? S2 : S;
  const checkMode: CheckMode = i === 4 ? st.check : "none";
  const tint = useMemo(() => {
    if (checkMode === "none" || checkMode === "resample") return null;
    const k = CONF_KEY[checkMode];
    const kinds = [...new Set(data.donors.map((d) => String(d[k])))].sort();
    const m = new Map(kinds.map((x, j) => [x, TINTS[Math.min(j, TINTS.length - 1)]!]));
    return new Map(data.donors.map((d) => [d.id, m.get(String(d[k]))!]));
  }, [checkMode]);
  const observed = i >= 3 && (showVerdict || st.revealed) ? (viewS === S2 ? S2!.trendKey : S.trendKey) : null;

  const plotPanel = (revealed: boolean) => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PredictionIndicator predicted={viewS === S2 ? null : st.hyp} observed={observed} />
        {revealed && (
          <button type="button" aria-pressed={table} onClick={() => setTable((t) => !t)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", table ? "border-peri/40 bg-peri-soft text-peri-ink" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
            <Table2 className="size-3.5" /> {ui.common.showTable}
          </button>
        )}
      </div>
      {table ? <StatsTable Q={viewS.Q} /> : <DonorPlot Q={viewS.Q} colour={cellColourVar(viewS.view.cellType)} tint={tint} revealed={revealed} delay={st.revealed ? 0 : 0.2} />}
      {revealed && <p className="text-xs leading-relaxed text-muted-foreground">{L.dotNote}</p>}
      {i >= 3 && <Readouts S={viewS} show={showVerdict || st.revealed} />}
    </div>
  );

  /* ---------- the five steps ---------- */
  let visual: ReactNode = null;
  let reading: ReactNode = null;
  let pill: { label: string; dim?: boolean; onClick: () => void } = { label: "", onClick: next };

  if (i === 0) {
    visual = <div className="aspect-[440/280] w-full"><IntroVisual cs={cs} /></div>;
    reading = (
      <>
        <ReadingBlock><NumberedBlock n={1} label={ui.intro.background}><Rich as="p" text={cs.intro.background} vars={vars} /></NumberedBlock></ReadingBlock>
        <ReadingBlock delay={0.1}><NumberedBlock n={2} label={ui.intro.known}><Rich as="p" text={cs.intro.known} vars={vars} /></NumberedBlock></ReadingBlock>
        <ReadingBlock delay={0.2}><NumberedBlock n={3} label={ui.intro.gap}><Rich as="p" text={cs.intro.gap} vars={vars} className="font-medium" /></NumberedBlock></ReadingBlock>
      </>
    );
    pill = { label: ui.pills.setAim, onClick: next };
  }

  if (i === 1) {
    visual = plotPanel(false);
    const warn = lockWarn && !st.hyp;
    reading = (
      <>
        <ReadingBlock><NumberedBlock n={1} label={ui.aims.aim}><Rich as="p" text={cs.aims.aim} vars={vars} /></NumberedBlock></ReadingBlock>
        <ReadingBlock delay={0.1}>
          <NumberedBlock n={2} label={ui.aims.h0}>
            <Rich as="p" text={cs.aims.h0} vars={vars} />
            {level < 2 && <p className="text-sm text-muted-foreground">{L.h0Explainer}</p>}
          </NumberedBlock>
        </ReadingBlock>
        <ReadingBlock delay={0.2}>
          <NumberedBlock n={3} label={ui.aims.h1}>
            <Rich as="p" text={cs.aims.question} vars={vars} className="font-medium" />
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={fill(cs.aims.question, vars)}>
              {(["up", "same", "down"] as Hyp[]).map((h) => {
                const on = st.hyp === h;
                return (
                  <button
                    key={h}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={st.locked}
                    onClick={() => setSt((s) => ({ ...s, hyp: h }))}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed",
                      on ? "border-peri bg-peri-soft text-peri-ink" : "border-border bg-card hover:-translate-y-0.5 hover:border-peri/40",
                      st.locked && !on && "opacity-50",
                    )}
                  >
                    <span aria-hidden className="text-lg">{h === "up" ? "↗" : h === "down" ? "↘" : "→"}</span>
                    {ui.aims[h]}
                  </button>
                );
              })}
            </div>
            <AnimatePresence mode="wait">
              {st.hyp && (
                <motion.div key={st.hyp} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-peri/25 bg-peri-soft/60 p-3">
                  <Rich as="p" text={cs.aims.h1[st.hyp]} vars={vars} className="font-medium text-foreground" />
                  {st.hyp === "same" && <p className="mt-1 text-sm text-muted-foreground">{L.predictingNull}</p>}
                </motion.div>
              )}
            </AnimatePresence>
            {warn && <p role="alert" className="text-sm font-medium text-coral-ink">{L.lockWarning}</p>}
            {st.locked && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="size-3.5" /> {L.lockedNote}</p>}
          </NumberedBlock>
        </ReadingBlock>
      </>
    );
    pill = {
      label: ui.pills.lock,
      dim: !st.hyp && !st.locked,
      onClick: () => {
        if (!st.hyp) { setLockWarn(true); return; }
        setSt((s) => ({ ...s, locked: true, step: 2, max: Math.max(s.max, 2) }));
      },
    };
  }

  if (i === 2) {
    const M = cs.methods, ck = M.check;
    const blocks = [
      { k: "data", text: L.methodsData },
      { k: "measure", text: M.measure },
      { k: "analysis", text: M.analysis },
    ];
    const SB = L.statsBasics?.[level];
    visual = <div className="aspect-[830/420] w-full"><StatsIllustration /></div>;
    reading = (
      <>
        {blocks.map((b, j) => (
          <ReadingBlock key={b.k} delay={j * 0.12}>
            <NumberedBlock n={j + 1} label={ui.methods[b.k]}><Rich as="p" text={b.text} vars={vars} /></NumberedBlock>
          </ReadingBlock>
        ))}
        {SB && (
          <ReadingBlock delay={0.4}>
            <div className="space-y-3 rounded-2xl border border-peri/25 bg-peri-soft/40 p-4">
              <p className="font-bold text-peri-ink">{SB.heading}</p>
              <dl className="space-y-2.5">
                {SB.items.map((it: { term: string; text: string }) => (
                  <div key={it.term}><dt className="font-semibold">{it.term}</dt><dd className="leading-relaxed text-foreground/85">{it.text}</dd></div>
                ))}
              </dl>
              {SB.recap && <p className="text-sm text-muted-foreground">{SB.recap}</p>}
            </div>
          </ReadingBlock>
        )}
        {easy && <ReadingBlock delay={0.5}>
          <div className="space-y-3 rounded-2xl border border-coral/30 bg-coral-soft/50 p-4">
            <p className="font-semibold">{ck.question}</p>
            <Segmented label={ck.question} options={trim(ck.options, ck.correct).map((o) => ({ id: o, label: o }))} value={st.methodsPick} onChange={(id) => setSt((s) => ({ ...s, methodsPick: id, methodsOk: s.methodsOk || id === ck.correct }))} />
            {st.methodsPick && <Feedback good={st.methodsPick === ck.correct}>{st.methodsPick === ck.correct ? ck.right : ck.wrong}</Feedback>}
          </div>
        </ReadingBlock>}
      </>
    );
    const ready = !easy || st.methodsOk;
    pill = { label: ui.pills.run, dim: !ready, onClick: () => { if (ready) next(); else toast(ck.question); } };
  }

  if (i === 3) {
    visual = plotPanel(true);
    const V = L.verdicts[verdictKey] || {};
    const v2 = S2 ? labVars(cs, S2, null) : {};
    reading = (
      <>
        <ReadingBlock>
          <div className="space-y-2">
            <p className="kicker">{L.explainLabels.look}</p>
            <Rich as="p" text={cs.results.look} vars={vars} />
            {!(st.second && S2) && showVerdict && <Rich as="p" text={cs.results.shows} vars={vars} className="font-medium" />}
          </div>
        </ReadingBlock>
        <AnimatePresence>
          {showVerdict && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-2 rounded-2xl border border-border bg-surface p-5">
              <p className="kicker">{ui.verdictWords[verdictKey]}</p>
              <p className="font-display-tight text-2xl font-medium"><mark className="marker-hl">{V.decision}</mark></p>
              <Rich as="p" text={V.body} vars={vars} />
              {verdictKey === "notSupported" && S.p < 0.1 && <Rich as="p" text={L.verdicts.notSupportedTrend} vars={vars} />}
            </motion.div>
          )}
        </AnimatePresence>
        {st.second && S2 && cs.results.exploratory && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 rounded-2xl border border-peri/30 bg-peri-soft/50 p-5">
            <p className="kicker text-peri-ink">{L.exploratoryLabel}</p>
            <Rich as="p" text={cs.results.exploratory} vars={v2} />
            <Rich as="p" text={cs.results.exploratoryShows} vars={v2} className="font-medium" />
          </motion.div>
        )}
      </>
    );
    pill = {
      label: two && !st.second ? ui.pills.second : ui.pills.discuss,
      dim: !showVerdict,
      onClick: () => {
        if (!showVerdict) return;
        if (two && !st.second) { setSt((s) => ({ ...s, second: true })); return; }
        next();
      },
    };
  }

  if (i === 4) {
    visual = plotPanel(true);
    const D = cs.discussion;
    const key = st.verdict || verdictKey;
    const abstract = labAbstract(cs, S, st.hyp, key);
    reading = (
      <>
        {level > 0 && <ReadingBlock><CheckBlock cs={cs} S={S} level={level} mode={st.check} setMode={(m) => setSt((s) => ({ ...s, check: m }))} /></ReadingBlock>}
        <ReadingBlock delay={0.08}>
          <NumberedBlock n={1} label={ui.discussion.conclusion}>
            <Claim easy={easy} parts={D.claim.parts} vars={vars} values={st.claim} onPick={(b, v) => setSt((s) => ({ ...s, claim: { ...s.claim, [b]: v } }))} />
          </NumberedBlock>
        </ReadingBlock>
        <ReadingBlock delay={0.14}>
          <NumberedBlock n={2} label={ui.discussion.limitations}>
            <div className="space-y-2">
              {D.limits.options.map((o, j) => {
                const sel = st.limits.sel.includes(j);
                const checked = st.limits.checked;
                return (
                  <button
                    key={j}
                    type="button"
                    aria-pressed={sel}
                    disabled={checked}
                    onClick={() => setSt((s) => ({ ...s, limits: { ...s.limits, sel: sel ? s.limits.sel.filter((x) => x !== j) : [...s.limits.sel, j] } }))}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-all disabled:cursor-default",
                      checked ? (o.applies ? "border-good/30 bg-good-soft/60" : "border-border bg-muted/50") : sel ? "border-peri bg-peri-soft" : "border-border bg-card hover:border-peri/40",
                    )}
                  >
                    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border", sel ? "border-peri bg-peri text-primary-foreground" : "border-border")}>{sel && <Check className="size-3.5" />}</span>
                    <span className="space-y-1">
                      <Rich as="span" text={o.statement} vars={vars} auto={false} className="block font-medium" />
                      {checked && (
                        <span className="block">
                          <span className={cn("mr-2 rounded px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider", o.applies ? "bg-good/15 text-good" : "bg-foreground/10 text-muted-foreground")}>{o.applies ? ui.discussion.applies : ui.discussion.notApplies}</span>
                          <Rich text={o.reason} vars={vars} auto={false} className="text-muted-foreground" />
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {!st.limits.checked && (
              <Button variant="soft" size="pillSm" onClick={() => setSt((s) => ({ ...s, limits: { ...s.limits, checked: true } }))}>
                {ui.discussion.checkButton}
              </Button>
            )}
          </NumberedBlock>
        </ReadingBlock>
        <ReadingBlock delay={0.2}>
          <NumberedBlock n={3} label={ui.discussion.published}>
            <Rich as="p" text={D.published} vars={vars} />
            <a href={D.publishedUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-peri-ink hover:underline">
              {data.meta.citation || D.publishedUrl} <ExternalLink className="size-3.5 shrink-0" /><span className="sr-only">{data.ui["newTab"]}</span>
            </a>
            <p className="text-sm text-muted-foreground">{L.teachingNote}</p>
            {D.ageNote && (
              <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral-ink"><strong>{L.ageNoteLabel}:</strong> {D.ageNote}</p>
            )}
          </NumberedBlock>
        </ReadingBlock>
        {level === 2 && <ReadingBlock delay={0.26}>
          <NumberedBlock n={4} label={ui.discussion.next}>
            <button
              type="button"
              onClick={() => { store.set("sandbox", { ...D.nextPreset }); navigate({ to: "/explore" }); }}
              className="group inline-flex items-center gap-2 text-left font-semibold text-peri-ink hover:underline"
            >
              {D.next} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </NumberedBlock>
        </ReadingBlock>}
        <ReadingBlock delay={0.32}>
          <div className="space-y-3 rounded-2xl border border-border bg-surface p-5">
            <p className="kicker">{L.abstractTitle}</p>
            <p className="font-display-tight text-[1.05rem] leading-relaxed text-foreground">{abstract}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="soft" size="pillSm" onClick={() => navigator.clipboard?.writeText(abstract).then(() => toast(data.ui["copied"]), () => {})}>
                <Copy className="size-3.5" /> {ui.abstract.copy}
              </Button>
              <Button
                variant="soft"
                size="pillSm"
                onClick={() => {
                  const all = (store.get<any[]>("findings") || []).filter((f) => f.id !== "lab:" + cs.id);
                  all.push({ id: "lab:" + cs.id, source: "lab", investigation: cs.id, title: cs.plainTitle, hypothesis: st.hyp, verdict: key, p: S.pText, text: abstract, savedAt: new Date().toISOString() });
                  store.set("findings", all);
                  setSt((s) => ({ ...s, saved: true }));
                  toast(ui.abstract.save);
                }}
              >
                {st.saved ? <Check className="size-3.5" /> : <Save className="size-3.5" />} {ui.abstract.save}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="go"
                size="pillSm"
                onClick={() => {
                  const esc = abstract.replace(/&/g, "&amp;").replace(/</g, "&lt;");
                  const prev = store.get<string>("report") || "";
                  store.set("report", prev + (prev ? "<p><br></p>" : "") + "<h2>" + cs.plainTitle.replace(/</g, "&lt;") + "</h2><p>" + esc + "</p>");
                  navigate({ to: "/write" });
                }}
              >
                {L.toWriter} <ArrowRight className="size-3.5" />
              </Button>
              {level === 2 && <Button variant="gold" size="pillSm" onClick={() => navigate({ to: "/prize" })}>{fill(L.toPrize)} <ArrowRight className="size-3.5" /></Button>}
            </div>
            <p className="text-sm text-muted-foreground">{L.abstractNote}</p>
          </div>
        </ReadingBlock>
      </>
    );
    pill = {
      label: isLast ? ui.pills.own : ui.pills.next,
      onClick: () => {
        setSt((s) => ({ ...s, finished: true, verdict: s.verdict || verdictKey }));
        if (isLast) navigate({ to: "/explore" });
        else onNextCase();
      },
    };
  }

  const part: string | undefined = L.writeUp?.steps?.[i];
  if (part)
    reading = (
      <>
        {reading}
        <ReadingBlock delay={0.6}><WriteUp id={part} level={level} /></ReadingBlock>
      </>
    );

  return (
    <div ref={top} className="scroll-mt-24">
      {/* step rail */}
      <ol className="mb-6 grid grid-cols-5 gap-1.5 sm:gap-2" aria-label={cs.plainTitle}>
        {names.map((nm, k) => {
          const on = k === i;
          const reachable = k <= st.max;
          return (
            <li key={nm}>
              <button
                type="button"
                onClick={() => goStep(k)}
                disabled={!reachable}
                aria-current={on ? "step" : undefined}
                className={cn("group w-full text-left disabled:cursor-not-allowed", !reachable && "opacity-45")}
              >
                <span className="relative block h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.span className="absolute inset-y-0 left-0 rounded-full bg-coral" initial={false} animate={{ width: reachable ? "100%" : "0%", opacity: on ? 1 : 0.4 }} transition={{ duration: 0.4 }} />
                </span>
                <span className="mt-2 flex items-baseline gap-1.5">
                  <span className={cn("font-mono text-[0.7rem]", on ? "text-coral-ink" : "text-muted-foreground")}>{String(k + 1).padStart(2, "0")}</span>
                  <span className={cn("hidden truncate text-sm font-semibold sm:inline", on ? "text-foreground" : "text-muted-foreground group-enabled:group-hover:text-foreground")}>{nm}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mb-4 text-lg font-semibold sm:hidden">{names[i]}</p>

      <div className="card-surface overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-[1.2fr_1fr]"
          >
            <section aria-label={cs.plainTitle} className="min-w-0 border-b border-border bg-surface/60 p-5 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="lg:sticky lg:top-24">{visual}</div>
            </section>
            <section className="min-w-0 p-5 sm:p-8">
              <p className="mb-6 flex items-baseline gap-3">
                <span className="font-display-tight text-4xl font-medium text-coral">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display-tight text-2xl font-medium">{names[i]}</span>
              </p>
              <GlossaryScope>
                <div className="space-y-7">{reading}</div>
              </GlossaryScope>
            </section>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-5 py-4 sm:px-8">
          <button type="button" onClick={back} className="inline-flex items-center gap-1.5 text-sm font-medium text-peri-ink hover:underline">
            <ArrowLeft className="size-4" /> {ui.common.back}
          </button>
          <Button variant="coral" size="pill" aria-disabled={pill.dim || undefined} className={cn(pill.dim && "opacity-50")} onClick={pill.onClick}>
            {pill.label} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Discussion: try to break the result ---------- */
function CheckBlock({ cs, S, level, mode, setMode }: { cs: CaseStudy; S: LabStats; level: number; mode: CheckMode; setMode: (m: CheckMode) => void }) {
  const ui = LUI();
  const L = LAB();
  const reduced = useReducedMotion();
  const R = useMemo(() => labResample(cs, S), [cs, S]);
  const [flick, setFlick] = useState<number>(-1);
  useEffect(() => {
    if (mode !== "resample") return;
    if (reduced) { setFlick(5); return; }
    setFlick(0);
    const ts = [1, 2, 3, 4, 5].map((k) => window.setTimeout(() => setFlick(k), k * 260));
    return () => ts.forEach(clearTimeout);
  }, [mode, reduced]);
  const vars = labVars(cs, S, null);
  let out: ReactNode = null;
  if (mode === "resample") {
    const sign = (x: number) => (x > 0 ? "+" : x < 0 ? "-" : "") + num(Math.abs(x), S.Q.dec + 1);
    out = flick < 5 ? (
      <p className="font-display-tight text-3xl tabular-nums text-peri-ink">{sign(R.first5[Math.max(0, flick)] ?? 0)}</p>
    ) : (
      <div className="space-y-1">
        <Rich as="p" text={L.resample} vars={vars} className="font-semibold" />
        <p className="text-sm text-muted-foreground">{L.resampleExplain}</p>
      </div>
    );
  } else if (mode !== "none") {
    const k = CONF_KEY[mode];
    const kinds = [...new Set(data.donors.map((d) => String(d[k])))].sort();
    const lopsided = [S.first, S.last]
      .map((g) => {
        const top = kinds.map((x) => ({ x, n: g.rows.filter((r) => String(r.donor[k]) === x).length })).sort((a, b) => b.n - a.n)[0]!;
        return g.n && top.n / g.n > 0.7 ? fill(L.lopsided, { group: g.name, kind: top.x, variable: ui.check[mode] }) : null;
      })
      .filter(Boolean);
    const empty = [...new Set(S.Q.groups.flatMap((g) => (g.n ? kinds.filter((x) => !g.rows.some((r) => String(r.donor[k]) === x)).map((x) => (mode === "apoe" ? L.apoeEmpty : fill(L.emptyCell, { group: g.name, kind: x, variable: ui.check[mode] }))) : [])))];
    out = (
      <div className="space-y-3">
        <p className="flex flex-wrap gap-3 text-sm">
          {kinds.map((x, j) => (
            <span key={x} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full" style={{ background: TINTS[Math.min(j, 2)] }} />{x}</span>
          ))}
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-semibold">{L.tableColumns.n}</th>
                {kinds.map((x) => <th key={x} scope="col" className="px-3 py-2 text-right font-semibold">{x}</th>)}
              </tr>
            </thead>
            <tbody>
              {S.Q.groups.map((g) => (
                <tr key={g.name} className="border-t border-border">
                  <th scope="row" className="px-3 py-2 text-left font-medium">{g.name}</th>
                  {kinds.map((x) => <td key={x} className="px-3 py-2 text-right tabular-nums">{g.rows.filter((r) => String(r.donor[k]) === x).length}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lopsided.map((t) => <p key={t} className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral-ink">{t}</p>)}
        {empty.map((t) => <p key={t} className="rounded-xl bg-peri-soft px-3 py-2 text-sm text-peri-ink">{t}</p>)}
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <p className="kicker">{ui.check.label}</p>
      <Segmented label={ui.check.label} options={((level < 2 ? ["none", "age", "sex"] : ["none", "age", "sex", "apoe", "resample"]) as CheckMode[]).map((id) => ({ id, label: ui.check[id] }))} value={mode} onChange={setMode} />
      <p className="text-sm text-muted-foreground">{L.checkInvite}</p>
      <AnimatePresence mode="wait">
        {out && <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{out}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

/* ---------- the claim: each blank an inline choice, with one line of feedback ---------- */
function Claim({ easy, parts, vars, values, onPick }: { easy?: boolean; parts: (string | ClaimBlank)[]; vars: Record<string, any>; values: Record<string, string>; onPick: (b: string, v: string) => void }) {
  const blanks = parts.filter((p): p is ClaimBlank => typeof p !== "string");
  return (
    <div className="space-y-3">
      <p className="leading-[2.3]">
        {parts.map((p, j) =>
          typeof p === "string" ? (
            <span key={j}>{fill(p, vars)}</span>
          ) : (
            <span key={j} className="mx-1 inline-flex flex-wrap gap-1 align-middle">
              {(easy ? p.options.filter((o) => o === p.correct || o === p.options.find((x) => x !== p.correct)) : p.options).map((o) => {
                const on = values[p.blank] === o;
                const good = on && o === p.correct;
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onPick(p.blank, o)}
                    className={cn(
                      "rounded-full border px-3 py-0.5 text-sm font-semibold leading-6 transition-all",
                      on ? (good ? "border-good bg-good-soft text-good" : "border-coral bg-coral-soft text-coral-ink") : "border-dashed border-peri/50 bg-card text-peri-ink hover:border-solid hover:bg-peri-soft",
                    )}
                  >
                    {o}
                  </button>
                );
              })}
            </span>
          ),
        )}
      </p>
      {blanks.map((b) =>
        values[b.blank] ? (
          <Feedback key={b.blank} good={values[b.blank] === b.correct}>
            {values[b.blank] === b.correct ? b.right : b.wrong}
          </Feedback>
        ) : null,
      )}
    </div>
  );
}

/* ---------- writing help for each report part: lots at Easy, a tip and a question at Medium, questions only at Hard ---------- */
export function WriteUp({ id, level }: { id: string; level: number }) {
  const W = data.writing;
  const L = LAB();
  const sec = W?.sections?.find((x: { id: string }) => x.id === id);
  if (!sec) return null;
  const label: string = L.writeUp?.labels?.[level] ?? "";
  if (level === 0) {
    const e = sec.easy;
    return (
      <div className="space-y-3 rounded-2xl border-2 border-go/25 bg-go-soft/60 p-4">
        {e.learned && (
          <div className="flex gap-3">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-go" />
            <div><p className="font-bold text-go-ink">{L.writeUp.learnedLabel}</p><p className="mt-1 leading-relaxed">{e.learned}</p></div>
          </div>
        )}
        <div className="flex gap-3 border-t border-go/15 pt-3">
          <PenLine className="mt-0.5 size-5 shrink-0 text-go" />
          <div className="space-y-2">
            <p className="font-bold text-go-ink">{label}</p>
            <ul className="list-disc space-y-1 pl-5 leading-relaxed">{e.tips.map((t: string) => <li key={t}>{t}</li>)}</ul>
            {e.starter && <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{L.writeUp.starterLabel}:</span> <em>{e.starter}</em></p>}
          </div>
        </div>
      </div>
    );
  }
  if (level === 1) {
    const m = sec.medium;
    return (
      <div className="flex gap-3 rounded-2xl border border-go/25 bg-go-soft/40 p-4">
        <PenLine className="mt-0.5 size-5 shrink-0 text-go" />
        <div className="space-y-1.5">
          <p className="font-bold text-go-ink">{label}</p>
          <p className="leading-relaxed">{m.tip}</p>
          <p className="flex gap-2 leading-relaxed text-peri-ink"><HelpCircle className="mt-0.5 size-4 shrink-0" />{m.question}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 rounded-2xl border border-peri/25 bg-peri-soft/40 p-4">
      <HelpCircle className="mt-0.5 size-5 shrink-0 text-peri-ink" />
      <div className="space-y-1.5">
        <p className="font-bold text-peri-ink">{label}</p>
        <ul className="list-disc space-y-1 pl-5 leading-relaxed">{sec.hard.questions.map((q: string) => <li key={q}>{q}</li>)}</ul>
      </div>
    </div>
  );
}
