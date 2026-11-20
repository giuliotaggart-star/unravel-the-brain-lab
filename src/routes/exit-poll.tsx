import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Minus, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { Choice, Scale, StatementSteps } from "@/components/unravel/PollParts";
import { data, fill } from "@/lib/unravel/data";
import { anonId, pollEndpointOn, scoreOf, sendPoll, type Answer, type ExitPoll, type PollItem, type StartPoll } from "@/lib/unravel/poll";
import { useReducedMotion, useStored } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exit-poll")({
  head: () => ({
    meta: [
      { title: "Exit poll — Unravel" },
      { name: "description", content: "End the lesson: answer the same dementia statements again, then see the answers and how your thinking changed." },
      { property: "og:title", content: "Exit poll — Unravel" },
      { property: "og:description", content: "The same questions again, then the reveal: what changed since the start of the lesson?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExitPage,
});

function ExitPage() {
  const poll = data.poll;
  const ex = poll.exit;
  const items: PollItem[] = poll.items;
  const [start, , startReady] = useStored<StartPoll | null>("poll", null);
  const [done, setDone, ready] = useStored<ExitPoll | null>("exitPoll", null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [conf, setConf] = useState<Record<string, number>>({});
  const [r1, setR1] = useState<number | null>(null);
  const [e1, setE1] = useState<number | null>(null);
  const [e2, setE2] = useState("");
  const [e3, setE3] = useState<string[]>([]);
  const [e4, setE4] = useState("");
  const [phase, setPhase] = useState<"ask" | "rate">("ask");
  const reduced = useReducedMotion();

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const row: ExitPoll = { kind: "exit", at: new Date().toISOString(), anonId: anonId(), classCode: start?.classCode ?? "", answers: { ...answers }, conf: { ...conf }, r1, e1, e2, e3, e4: e4.trim().slice(0, 140), score: scoreOf(items, answers) };
    setDone(row);
    sendPoll(row);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };
  const again = () => {
    setDone(null);
    setAnswers({});
    setConf({});
    setPhase("ask");
  };

  return (
    <div>
      <ChapterOpener id="exit" heading={ex.heading} intro={ex.framing} />
      <PageWrap className="mt-12">
        <div className="mx-auto max-w-3xl space-y-6">
          {!ready || !startReady ? (
            <div className="card-surface h-80 animate-pulse" />
          ) : done ? (
            <Reveal start={start} end={done} items={items} onAgain={again} />
          ) : (
            <>
              {!start && <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">{poll.startNeeded}</p>}
              {phase === "ask" ? (
                <StatementSteps items={items} answers={answers} onAnswer={(id, a) => setAnswers((x) => ({ ...x, [id]: a }))} onDone={() => setPhase("rate")} />
              ) : (
                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} noValidate onSubmit={submit} className="card-surface space-y-8 px-6 py-10 sm:px-10">
                  <h2 className="font-display-tight text-2xl font-medium">{poll.confidenceHeading}</h2>
                  {poll.confidence.map((c: { id: string; statement: string }) => (
                    <Scale key={c.id} id={c.id} label={c.statement} value={conf[c.id]} onChange={(n) => setConf((x) => ({ ...x, [c.id]: n }))} />
                  ))}
                  <div className="space-y-8 border-t border-border pt-8">
                    <Scale id="r1" label={ex.r1} value={r1} onChange={setR1} />
                    <Scale id="e1" label={ex.e1} value={e1} onChange={setE1} labels={ex.e1Scale} />
                    <Choice label={ex.e2} options={ex.e2Options} value={e2} onChange={setE2} />
                    <Choice label={ex.e3} options={ex.e3Options} value={e3} onChange={setE3} multi />
                    <div className="space-y-2">
                      <label htmlFor="e4" className="font-semibold">{ex.e4}</label>
                      <textarea id="e4" maxLength={140} rows={2} value={e4} onChange={(e) => setE4(e.target.value)} className="w-full rounded-xl border border-input bg-card px-4 py-3 shadow-card outline-none focus-visible:border-peri focus-visible:ring-2 focus-visible:ring-peri/30" />
                      <p className="text-right font-mono text-xs text-muted-foreground">{e4.length}/140</p>
                    </div>
                  </div>
                  {pollEndpointOn() && <p className="text-sm text-muted-foreground">{poll.privacyShared}</p>}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <button type="button" onClick={() => setPhase("ask")} className="inline-flex items-center gap-1.5 text-sm font-medium text-peri-ink hover:underline">
                      <ArrowLeft className="size-4" /> {poll.backLabel}
                    </button>
                    <Button type="submit" variant="go" size="pill" className="h-12 px-8">{ex.submitLabel}</Button>
                  </div>
                </motion.form>
              )}
            </>
          )}
        </div>
      </PageWrap>
      <ChapterPager id="exit" />
    </div>
  );
}

function Mark({ a, correct }: { a: Answer | undefined; correct: Answer }) {
  const names: Record<Answer, string> = data.poll.options;
  const unsure = !a || a === "dk";
  const right = a === correct;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", unsure ? "bg-muted text-muted-foreground" : right ? "bg-good-soft text-good" : "bg-coral-soft text-coral-ink")}>
      {unsure ? <Minus className="size-3.5" /> : right ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {a ? names[a] : "–"}
    </span>
  );
}

function Reveal({ start, end, items, onAgain }: { start: StartPoll | null; end: ExitPoll; items: PollItem[]; onAgain: () => void }) {
  const poll = data.poll;
  const ex = poll.exit;
  const names: Record<Answer, string> = poll.options;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="card-surface flex flex-wrap items-end justify-between gap-6 p-6 sm:p-10">
        <h2 className="font-display-tight text-3xl font-medium">{ex.revealHeading}</h2>
        <div className="flex items-end gap-6 tabular-nums">
          {start && (
            <p className="text-center"><span className="kicker block">{ex.beforeLabel}</span><span className="font-display-tight text-4xl text-muted-foreground">{fill(poll.scoreText, { score: start.score, total: items.length })}</span></p>
          )}
          <p className="text-center"><span className="kicker block">{ex.afterLabel}</span><span className="font-display-tight text-5xl font-medium">{fill(poll.scoreText, { score: end.score, total: items.length })}</span></p>
        </div>
      </div>
      <ol className="card-surface divide-y divide-border overflow-hidden">
        {items.map((it) => (
          <li key={it.id} className="space-y-2 p-5 sm:p-6">
            <p className="text-lg font-semibold leading-snug">“{it.statement}”</p>
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {start && <>{ex.beforeLabel}: <Mark a={start.answers[it.id]} correct={it.correct} /></>}
              <span className="ml-1">{ex.afterLabel}:</span> <Mark a={end.answers[it.id]} correct={it.correct} />
              <span className="ml-1">{poll.correctAnswer}: <strong className="text-foreground">{names[it.correct]}</strong></span>
            </p>
            <p className="leading-relaxed text-foreground/80">{it.why}</p>
          </li>
        ))}
      </ol>
      {start && (
        <div className="card-surface space-y-4 p-6 sm:p-8">
          <h3 className="font-display-tight text-xl font-medium">{ex.shiftHeading}</h3>
          <ul className="space-y-3">
            {poll.confidence.map((c: { id: string; statement: string }) => {
              const a = start.conf?.[c.id];
              const b = end.conf[c.id];
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3">
                  <span>{c.statement}</span>
                  <span className="font-mono text-sm tabular-nums">{a ?? "–"} → <strong>{b ?? "–"}</strong> / 5</span>
                </li>
              );
            })}
          </ul>
          {pollEndpointOn() && <p className="text-sm text-muted-foreground">{ex.classNote}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="soft" size="pill" onClick={onAgain}><RotateCcw className="size-4" /> {ex.retakeLabel}</Button>
        <Button asChild variant="go" size="pill"><Link to="/explore">{ex.nextCta} <ArrowRight className="size-4" /></Link></Button>
      </div>
    </motion.div>
  );
}
