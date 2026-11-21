import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { Choice, Scale, StatementSteps } from "@/components/unravel/PollParts";
import { data, isText } from "@/lib/unravel/data";
import { anonId, pollEndpointOn, scoreOf, sendPoll, type Answer, type PollItem, type StartPoll } from "@/lib/unravel/poll";
import { useReducedMotion, useStored } from "@/lib/unravel/store";

export const Route = createFileRoute("/poll")({
  head: () => ({
    meta: [
      { title: "Warm-up poll — Unravel" },
      { name: "description", content: "Start the lesson: six statements about dementia and three quick ratings. Answers are revealed at the end." },
      { property: "og:title", content: "Warm-up poll — Unravel" },
      { property: "og:description", content: "What do you already know about dementia? Find out at the end of the lesson." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PollPage,
});

/* Screen 1: just today's topic. No definitions here: they would give away poll answers. */
function TopicIntro({ onStart }: { onStart: () => void }) {
  const poll = data.poll;
  const topic = (data as any).background.topic;
  return (
    <div className="mt-10 max-w-3xl">
      <p className="kicker text-go">{poll.topicKicker}</p>
      <h1 className="font-display-tight mt-3 text-[clamp(2.75rem,9vw,5.5rem)] font-medium leading-[0.95] text-go">{topic}</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{poll.topicLine}</p>
      <Button variant="go" size="pill" className="mt-8 h-12 px-8" onClick={onStart}>
        {poll.startLabel} <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

function PollPage() {
  const poll = data.poll;
  const items: PollItem[] = poll.items;
  const [submitted, setSubmitted, ready] = useStored<StartPoll | null>("poll", null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [conf, setConf] = useState<Record<string, number>>({});
  const [year, setYear] = useState("");
  const [phase, setPhase] = useState<"topic" | "ask" | "rate">("topic");
  const [code, setCode] = useState("");
  const [codeOpen, setCodeOpen] = useState(false);
  const reduced = useReducedMotion();

  const ratingsDone = poll.confidence.every((c: { id: string }) => conf[c.id] != null);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!ratingsDone) return;
    const row: StartPoll = { kind: "start", at: new Date().toISOString(), anonId: anonId(), classCode: code.trim().slice(0, 24), year, answers: { ...answers }, conf: { ...conf }, score: scoreOf(items, answers) };
    setSubmitted(row);
    sendPoll(row);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div>
      {ready && !submitted && phase === "topic" ? (
        <ChapterOpener id="poll" compact>
          <TopicIntro onStart={() => { setPhase("ask"); window.scrollTo({ top: 0, behavior: "auto" }); }} />
        </ChapterOpener>
      ) : (
        <ChapterOpener id="poll" compact heading={poll.heading} intro={submitted ? undefined : poll.framing} />
      )}
      <PageWrap className="mt-12">
        <div className="mx-auto max-w-3xl">
          {!ready ? (
            <div className="card-surface h-80 animate-pulse" />
          ) : submitted ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-surface flex flex-col items-center gap-4 px-6 py-12 text-center sm:px-10">
              <CheckCircle2 className="size-10 text-good" aria-hidden />
              <h2 className="font-display-tight text-3xl font-medium">{poll.thanksHeading}</h2>
              <p className="max-w-lg text-muted-foreground">{poll.thanksLine}</p>
              <Button asChild variant="go" size="pill" className="mt-2">
                  <Link to="/what-dementia-is">{poll.nextLabel} <ArrowRight className="size-4" /></Link>
              </Button>
            </motion.div>
          ) : phase === "topic" ? null : phase === "ask" ? (
            <StatementSteps items={items} answers={answers} onAnswer={(id, a) => setAnswers((x) => ({ ...x, [id]: a }))} onDone={() => setPhase("rate")} />
          ) : (
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} noValidate onSubmit={submit} className="card-surface space-y-8 px-6 py-10 sm:px-10">
              <h2 className="font-display-tight text-2xl font-medium">{poll.confidenceHeading}</h2>
              {poll.confidence.map((c: { id: string; statement: string }) => (
                <Scale key={c.id} id={c.id} label={c.statement} value={conf[c.id]} onChange={(n) => setConf((x) => ({ ...x, [c.id]: n }))} />
              ))}
              <Choice label={poll.yearLabel} options={poll.years} value={year} onChange={setYear} />
              {!codeOpen && isText(poll.classCodeLink) && (
                <button type="button" onClick={() => setCodeOpen(true)} className="block text-sm font-medium text-peri-ink hover:underline">{poll.classCodeLink}</button>
              )}
              {codeOpen && (
                <div className="max-w-sm space-y-2">
                  <label htmlFor="classcode" className="kicker">{poll.classCodeLabel}</label>
                  <input id="classcode" type="text" maxLength={24} autoComplete="off" autoCapitalize="characters" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} aria-describedby="classcode-hint" className="h-12 w-full rounded-xl border border-input bg-card px-4 font-mono uppercase tracking-wider shadow-card outline-none focus-visible:border-peri focus-visible:ring-2 focus-visible:ring-peri/30" />
                  <p id="classcode-hint" className="text-sm text-muted-foreground">{poll.classCodeHint}</p>
                </div>
              )}
              {pollEndpointOn() && <p className="text-sm text-muted-foreground">{poll.privacyShared}</p>}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button type="button" onClick={() => setPhase("ask")} className="inline-flex items-center gap-1.5 text-sm font-medium text-peri-ink hover:underline">
                  <ArrowLeft className="size-4" /> {poll.backLabel}
                </button>
                <Button type="submit" variant="go" size="pill" className="h-12 px-8" disabled={!ratingsDone} aria-describedby={ratingsDone ? undefined : "ratings-needed"}>{poll.submitLabel}</Button>
              </div>
              {!ratingsDone && <p id="ratings-needed" className="text-right text-sm text-muted-foreground">{poll.ratingsNeeded}</p>}
            </motion.form>
          )}
        </div>
      </PageWrap>
      {ready && !submitted && <ChapterPager id="poll" />}
    </div>
  );
}
