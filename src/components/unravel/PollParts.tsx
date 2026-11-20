import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { data, fill } from "@/lib/unravel/data";
import { KEYS, type Answer, type PollItem } from "@/lib/unravel/poll";
import { useReducedMotion } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

/** One statement at a time, True / False / Don't know, with keys 1–3. */
export function StatementSteps({ items, answers, onAnswer, onDone }: { items: PollItem[]; answers: Record<string, Answer>; onAnswer: (id: string, a: Answer) => void; onDone: () => void }) {
  const poll = data.poll;
  const names: Record<Answer, string> = poll.options;
  const [index, setIndex] = useState(0);
  const timer = useRef<number>(0);
  const reduced = useReducedMotion();
  const it = items[index]!;
  const choose = (k: Answer) => {
    window.clearTimeout(timer.current);
    onAnswer(it.id, k);
    timer.current = window.setTimeout(() => (index < items.length - 1 ? setIndex((i) => i + 1) : onDone()), 400);
  };
  useEffect(() => {
    const on = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement)?.tagName === "INPUT" || (ev.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const k = ({ "1": "true", "2": "false", "3": "dk" } as Record<string, Answer>)[ev.key];
      if (k) choose(k);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex gap-1.5 px-6 pt-6 sm:px-10 sm:pt-8" aria-hidden>
        {items.map((x, i) => (
          <span key={x.id} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", i < index || answers[x.id] ? "bg-coral" : i === index ? "bg-peri/40" : "bg-muted")} />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={it.id} initial={{ opacity: 0, x: reduced ? 0 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -24 }} transition={{ duration: 0.28 }} className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10">
          <p className="kicker">{fill(poll.ofLabel, { n: index + 1, total: items.length })}</p>
          <p id="stmt" className="font-display-tight mt-4 min-h-[5.5rem] text-[clamp(1.6rem,4vw,2.5rem)] font-medium leading-tight">“{it.statement}”</p>
          <div role="group" aria-labelledby="stmt" className="mt-8 grid gap-3 sm:grid-cols-3">
            {KEYS.map((k, ki) => {
              const on = answers[it.id] === k;
              return (
                <button key={k} type="button" aria-pressed={on} onClick={() => choose(k)} className={cn("group flex h-16 items-center justify-between rounded-2xl border-2 px-5 text-left text-lg font-semibold transition-all", on ? "border-peri bg-peri-soft text-peri-ink" : "border-border bg-card hover:-translate-y-0.5 hover:border-peri/40 hover:shadow-card")}>
                  {names[k]}
                  <span className={cn("flex size-7 items-center justify-center rounded-md border font-mono text-xs", on ? "border-peri/50 text-peri-ink" : "border-border text-muted-foreground")}>{ki + 1}</span>
                </button>
              );
            })}
          </div>
          {index > 0 && (
            <button type="button" onClick={() => { window.clearTimeout(timer.current); setIndex((i) => i - 1); }} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-peri-ink hover:underline">
              <ArrowLeft className="size-4" /> {poll.backLabel}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** A 1–5 row of buttons for one statement. */
export function Scale({ id, label, value, onChange, labels }: { id: string; label: string; value: number | null | undefined; onChange: (n: number) => void; labels?: string[] }) {
  const names: string[] = labels ?? data.poll.scale;
  return (
    <fieldset className="space-y-3">
      <legend className="font-semibold leading-snug">{label}</legend>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {names.map((n, i) => {
          const on = value === i + 1;
          return (
            <button key={n} type="button" aria-pressed={on} aria-label={`${i + 1}: ${n}`} onClick={() => onChange(i + 1)} className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-2 text-center transition-all", on ? "border-peri bg-peri-soft text-peri-ink" : "border-border bg-card hover:border-peri/40")} name={id}>
              <span className="font-mono text-sm font-semibold">{i + 1}</span>
              <span className="text-[0.68rem] leading-tight text-muted-foreground sm:text-xs">{n}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Choice({ label, options, value, onChange, multi }: { label: string; options: string[]; value: string | string[]; onChange: (v: any) => void; multi?: boolean }) {
  const has = (o: string) => (multi ? (value as string[]).includes(o) : value === o);
  return (
    <fieldset className="space-y-3">
      <legend className="font-semibold leading-snug">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={has(o)} onClick={() => onChange(multi ? (has(o) ? (value as string[]).filter((x) => x !== o) : [...(value as string[]), o]) : o)} className={cn("rounded-full border-2 px-4 py-2 text-sm font-medium transition-all", has(o) ? "border-peri bg-peri-soft text-peri-ink" : "border-border bg-card hover:border-peri/40")}>
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
