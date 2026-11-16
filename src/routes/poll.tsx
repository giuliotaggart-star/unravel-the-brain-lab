import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Minus, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { data, fill, isText, isUrl } from "@/lib/unravel/data";
import { useReducedMotion, useStored } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/poll")({
  head: () => ({
    meta: [
      { title: "Dementia poll — Unravel" },
      { name: "description", content: "Six statements about dementia. Go with your gut, then see a plain reason for each answer." },
      { property: "og:title", content: "Dementia poll — Unravel" },
      { property: "og:description", content: "What do you already know about dementia? Six statements, instant feedback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PollPage,
});

type Answer = "true" | "false" | "dk";
interface Submitted { at: string; classCode: string; answers: Record<string, Answer>; score: number }
const KEYS: Answer[] = ["true", "false", "dk"];

function PollPage() {
  const poll = data.poll;
  const items: { id: string; statement: string; correct: Answer; why: string }[] = poll.items;
  const names: Record<Answer, string> = poll.options;
  const endpoint = isUrl(data.config["pollEndpoint"]) ? data.config["pollEndpoint"] : null;
  const [submitted, setSubmitted, ready] = useStored<Submitted | null>("poll", null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"ask" | "end">("ask");
  const [code, setCode] = useState("");
  const [codeOpen, setCodeOpen] = useState(false);
  const timer = useRef<number>(0);
  const reduced = useReducedMotion();

  const it = items[index]!;
  const choose = (k: Answer) => {
    if (phase !== "ask") return;
    window.clearTimeout(timer.current);
    setAnswers((a) => ({ ...a, [it.id]: k }));
    timer.current = window.setTimeout(() => {
      if (index < items.length - 1) setIndex((i) => i + 1);
      else setPhase("end");
    }, 400);
  };
  useEffect(() => {
    const on = (ev: KeyboardEvent) => {
      if (submitted || phase !== "ask") return;
      if ((ev.target as HTMLElement)?.tagName === "INPUT") return;
      const k = ({ "1": "true", "2": "false", "3": "dk" } as Record<string, Answer>)[ev.key];
      if (k) choose(k);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const score = items.filter((i) => answers[i.id] === i.correct).length;
    const s: Submitted = { at: new Date().toISOString(), classCode: code.trim().slice(0, 24), answers: { ...answers }, score };
    setSubmitted(s);
    if (endpoint) {
      try {
        fetch(endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(s) }).catch(() => {});
      } catch {
        /* offline: the result is still shown */
      }
    }
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };
  const retake = () => {
    setSubmitted(null);
    setAnswers({});
    setIndex(0);
    setPhase("ask");
    setCode("");
    setCodeOpen(false);
  };

  return (
    <div>
      <ChapterOpener id="poll" heading={poll.heading} intro={poll.framing} />
      <PageWrap className="mt-12">
        <div className="mx-auto max-w-3xl">
          {!ready ? (
            <div className="card-surface h-80 animate-pulse" />
          ) : submitted ? (
            <Result submitted={submitted} items={items} names={names} onRetake={retake} />
          ) : phase === "ask" ? (
            <div className="card-surface overflow-hidden">
              <div className="flex gap-1.5 px-6 pt-6 sm:px-10 sm:pt-8" aria-hidden>
                {items.map((x, i) => (
                  <span key={x.id} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", i < index || answers[x.id] ? "bg-coral" : i === index ? "bg-peri/40" : "bg-muted")} />
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, x: reduced ? 0 : 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduced ? 0 : -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10"
                >
                  <p className="kicker">{fill(poll.ofLabel, { n: index + 1, total: items.length })}</p>
                  <p id="stmt" className="font-display-tight mt-4 min-h-[5.5rem] text-[clamp(1.6rem,4vw,2.5rem)] font-medium leading-tight">
                    “{it.statement}”
                  </p>
                  <div role="group" aria-labelledby="stmt" className="mt-8 grid gap-3 sm:grid-cols-3">
                    {KEYS.map((k, ki) => {
                      const on = answers[it.id] === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={on}
                          onClick={() => choose(k)}
                          className={cn(
                            "group flex h-16 items-center justify-between rounded-2xl border-2 px-5 text-left text-lg font-semibold transition-all",
                            on ? "border-peri bg-peri-soft text-peri-ink" : "border-border bg-card hover:-translate-y-0.5 hover:border-peri/40 hover:shadow-card",
                          )}
                        >
                          {names[k]}
                          <span className={cn("flex size-7 items-center justify-center rounded-md border font-mono text-xs", on ? "border-peri/50 text-peri-ink" : "border-border text-muted-foreground")}>{ki + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        window.clearTimeout(timer.current);
                        setIndex((i) => i - 1);
                      }}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-peri-ink hover:underline"
                    >
                      <ArrowLeft className="size-4" /> {poll.backLabel}
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} noValidate onSubmit={submit} className="card-surface flex flex-col items-center gap-5 px-6 py-12 text-center sm:px-10">
              <Button type="submit" variant="coral" size="pill" className="h-14 px-10 text-lg">
                {poll.submitLabel}
              </Button>
              {!codeOpen && isText(poll.classCodeLink) && (
                <button type="button" onClick={() => setCodeOpen(true)} className="text-sm font-medium text-peri-ink hover:underline">
                  {poll.classCodeLink}
                </button>
              )}
              {codeOpen && (
                <div className="w-full max-w-sm space-y-2 text-left">
                  <label htmlFor="classcode" className="kicker">{poll.classCodeLabel}</label>
                  <input
                    id="classcode"
                    type="text"
                    maxLength={24}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    aria-describedby="classcode-hint"
                    className="h-12 w-full rounded-xl border border-input bg-card px-4 font-mono uppercase tracking-wider shadow-card outline-none focus-visible:border-peri focus-visible:ring-2 focus-visible:ring-peri/30"
                  />
                  <p id="classcode-hint" className="text-sm text-muted-foreground">{poll.classCodeHint}</p>
                </div>
              )}
              {endpoint && <p className="text-sm text-muted-foreground">{poll.privacyShared}</p>}
              <button
                type="button"
                onClick={() => {
                  setPhase("ask");
                  setIndex(items.length - 1);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-peri-ink hover:underline"
              >
                <ArrowLeft className="size-4" /> {poll.backLabel}
              </button>
            </motion.form>
          )}
        </div>
      </PageWrap>
      <ChapterPager id="poll" />
    </div>
  );
}

function Result({ submitted, items, names, onRetake }: { submitted: Submitted; items: { id: string; statement: string; correct: Answer; why: string }[]; names: Record<Answer, string>; onRetake: () => void }) {
  const poll = data.poll;
  const counts = { right: 0, wrong: 0, dk: 0 };
  items.forEach((i) => {
    const mine = submitted.answers[i.id];
    if (!mine || mine === "dk") counts.dk += 1;
    else if (mine === i.correct) counts.right += 1;
    else counts.wrong += 1;
  });
  const pct = (n: number) => `${(n / items.length) * 100}%`;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div className="card-surface p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-display-tight text-[clamp(3.5rem,10vw,6rem)] font-medium leading-none tabular-nums" tabIndex={-1}>
            {fill(poll.scoreText, { score: submitted.score, total: items.length })}
          </p>
          <ul className="flex flex-wrap gap-2 text-sm">
            <li className="flex items-center gap-2 rounded-full bg-good-soft px-3 py-1.5 font-medium text-good"><Check className="size-4" /> {poll.rightLabel} · {counts.right}</li>
            <li className="flex items-center gap-2 rounded-full bg-coral-soft px-3 py-1.5 font-medium text-coral-ink"><X className="size-4" /> {poll.wrongLabel} · {counts.wrong}</li>
            <li className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-medium text-muted-foreground"><Minus className="size-4" /> {names.dk} · {counts.dk}</li>
          </ul>
        </div>
        <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <motion.span className="bg-good" initial={{ width: 0 }} animate={{ width: pct(counts.right) }} transition={{ duration: 0.8, delay: 0.2 }} />
          <motion.span className="bg-coral" initial={{ width: 0 }} animate={{ width: pct(counts.wrong) }} transition={{ duration: 0.8, delay: 0.35 }} />
        </div>
      </div>
      <ol className="card-surface divide-y divide-border overflow-hidden">
        {items.map((item, i) => {
          const mine = submitted.answers[item.id];
          const unsure = !mine || mine === "dk";
          const right = mine === item.correct;
          const verdict = unsure ? names.dk : right ? poll.rightLabel : poll.wrongLabel;
          return (
            <motion.li key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="flex gap-4 p-5 sm:p-6">
              <span
                role="img"
                aria-label={verdict}
                className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full", unsure ? "bg-muted text-muted-foreground" : right ? "bg-good-soft text-good" : "bg-coral-soft text-coral-ink")}
              >
                {unsure ? <Minus className="size-4" /> : right ? <Check className="size-4" /> : <X className="size-4" />}
              </span>
              <div className="min-w-0 space-y-1.5">
                <p className="text-lg font-semibold leading-snug">“{item.statement}”</p>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">
                    {poll.yourAnswer}: <span className="font-medium text-foreground">{mine ? names[mine] : "–"}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {poll.correctAnswer}: <span className="font-medium text-foreground">{names[item.correct]}</span>
                  </span>
                </p>
                {isText(item.why) && <p className="leading-relaxed text-foreground/80">{item.why}</p>}
              </div>
            </motion.li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="soft" size="pill" onClick={onRetake}>
          <RotateCcw className="size-4" /> {poll.retakeLabel}
        </Button>
        <Button asChild variant="go" size="pill">
          <Link to="/what-dementia-is">
            {poll.resultCta} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
