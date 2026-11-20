import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Check, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PSec, SidePage, Ticks } from "@/components/unravel/SidePage";
import { data, fill, isText, isUrl } from "@/lib/unravel/data";
import { store } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prize")({
  head: () => ({
    meta: [
      { title: "Abstract competition: £50 prize — Unravel" },
      { name: "description", content: "Write a short scientific report of up to 300 words on real SEA-AD data. Every entry gets personal feedback." },
      { property: "og:title", content: "Abstract competition: £50 prize — Unravel" },
      { property: "og:description", content: "Introduction, methods, results, discussion: write your report on real Alzheimer's data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Prize,
});

const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

function Prize() {
  const p = data.prize;
  const cfg = data.config;
  const B = (p as any).brief;
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => setDraft(store.get<Record<string, string>>("essay") || {}), []);
  const update = (id: string, v: string) => setDraft((d) => { const n = { ...d, [id]: v }; store.set("essay", n); return n; });
  const total = p.sections.reduce((a: number, s: any) => a + words(draft[s.id] || ""), 0);
  const over = total - p.wordsMax;
  const hasDeadline = isText(cfg["essayDeadline"]) && cfg["essayDeadline"] !== "PLACEHOLDER";
  const text = () => p.sections.map((s: any) => `${s.label}\n${(draft[s.id] || "").trim()}`).join("\n\n");
  return (
    <SidePage gold heading={fill(p.title)} tag={fill(p.prizeTag)} intro={p.intro}>
      <PSec title={p.submitGroupHeading}>
        <div className="space-y-3 text-lg leading-relaxed">
          <p>{B.lead}</p>
          <p className="font-semibold text-go">{B.lead2}</p>
        </div>
        <div className="rounded-2xl border border-peri/30 bg-peri-soft p-6">
          <p className="mb-4 font-bold text-go">{B.includeHeading}</p>
          <ol className="grid gap-3 sm:grid-cols-2">
            {B.include.map((x: any, i: number) => (
              <li key={x.label} className="flex gap-3 rounded-xl bg-card p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-go font-bold text-go-foreground">{i + 1}</span>
                <span><span className="block font-bold">{x.label}</span><span className="text-muted-foreground">{x.text}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">{B.notExpected}</p>
        </div>
        <div className="rounded-2xl border border-gold/40 bg-gold-soft p-6">
          <p className="mb-3 font-bold text-go">{B.rulesHeading}</p>
          <ul className="space-y-2">
            {B.rules.map((r: string, i: number) => (
              <li key={r} className="flex gap-3"><Check className={cn("mt-1 size-4 shrink-0", i === 0 ? "text-destructive" : "text-gold-ink")} aria-hidden /><span className={i < 2 ? "font-semibold" : ""}>{fill(r)}</span></li>
            ))}
          </ul>
        </div>
      </PSec>
      <PSec title={B.scoreHeading}>
        <p className="text-lg">{B.scoreLead}</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {B.score.map((x: any) => (
            <div key={x.label} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
              <span className="w-16 shrink-0 text-center font-display-tight text-3xl font-medium text-go">{x.points}</span>
              <span><span className="block font-bold">{x.label}</span><span className="text-sm text-muted-foreground">{x.text}</span></span>
            </div>
          ))}
          <div className="flex items-center gap-4 bg-go p-4 text-go-foreground">
            <span className="w-16 shrink-0 text-center font-display-tight text-3xl font-semibold">{B.scoreTotal}</span>
            <span className="font-bold">{B.scoreTotalLabel}</span>
          </div>
        </div>
      </PSec>
      <PSec title={p.keyDetailsHeading}>
        <dl className="grid gap-6 sm:grid-cols-2">
          <div className="border-l-4 border-gold pl-4">
            <dt className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gold-ink"><Calendar className="size-4" aria-hidden />Deadline</dt>
            <dd className="mt-2 font-display-tight text-2xl font-medium leading-snug text-go">{hasDeadline ? fill(B.deadlineTime) : "To be confirmed."}</dd>
          </div>
          {p.details.filter((x: any) => x.label === "Prize").map((x: any) => (
            <div key={x.label} className="border-l-4 border-gold pl-4">
              <dt className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gold-ink"><Trophy className="size-4" aria-hidden />{x.label}</dt>
              <dd className="mt-2 font-display-tight text-2xl font-medium leading-snug text-go">{fill(x.value)}</dd>
            </div>
          ))}
        </dl>
        {p.rules.length > 0 && (
          <div className="card-surface p-5"><p className="mb-2 font-bold">{p.rulesHeading}</p><Ticks items={p.rules.slice(0, 2).map((r: string) => fill(r))} /></div>
        )}
        <div className="card-surface p-5"><p className="mb-1 font-bold">{B.afterHeading}</p><p className="text-muted-foreground">{B.after}</p></div>
      </PSec>
      <section className="rounded-2xl border border-gold/40 bg-gold-soft p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display-tight text-3xl font-medium">{p.submitHeading}</h2>
          {isUrl(cfg["essayFormUrl"]) ? (
            <Button asChild variant="gold" size="pill"><a href={cfg["essayFormUrl"]} target="_blank" rel="noopener">{p.submitLabel} ↗</a></Button>
          ) : (
            <div className="text-right"><Button variant="gold" size="pill" disabled>{p.submitLabel}</Button><p className="mt-1 text-sm text-muted-foreground">{p.submitPending}</p></div>
          )}
        </div>
        {p.submitPrivacy.map((x: string) => <p key={x} className="text-sm text-muted-foreground">{x}</p>)}
        <p className="flex flex-wrap gap-x-4 text-sm font-medium">
          <Link to="/terms" className="text-peri-ink underline underline-offset-2">{p.termsLink}</Link>
          <Link to="/privacy" className="text-peri-ink underline underline-offset-2">{data.footer["privacyLink"]}</Link>
        </p>
      </section>
      <PSec title={p.builderHeading}>
        <p>{p.builderIntro}</p>
        <p className="text-sm text-muted-foreground">{p.originalityNote}</p>
        {p.sections.map((s: any) => {
          const c = words(draft[s.id] || "");
          return (
            <div key={s.id} className="card-surface space-y-2 p-5">
              <label htmlFor={"essay-" + s.id} className="block text-xl font-bold text-go">{s.label}</label>
              <p className="text-muted-foreground">{s.prompt}</p>
              {s.tip && <p className="rounded-lg border-l-4 border-peri bg-peri-soft px-3 py-2 text-sm">{s.tip}</p>}
              <textarea id={"essay-" + s.id} rows={Math.max(4, Math.round(s.target / 22))} value={draft[s.id] || ""} onChange={(e) => update(s.id, e.target.value)} className="w-full rounded-xl border border-input bg-card p-3 outline-none focus-visible:border-peri focus-visible:ring-2 focus-visible:ring-peri/30" />
              <p className="text-xs text-muted-foreground">{fill(p.wordCount, { count: c, target: s.target })}</p>
            </div>
          );
        })}
        <p className={cn("sticky bottom-4 rounded-full border bg-card/95 px-4 py-2 text-center text-sm font-medium shadow-lift backdrop-blur", over > 0 ? "border-destructive text-destructive" : "border-border")}>
          {over > 0 ? fill(p.totalOver, { over }) : fill(p.totalCount, { count: total })}
        </p>
        <div className="card-surface p-5"><p className="mb-3 font-bold">{p.checklistHeading}</p><Ticks items={p.checklist} /></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="soft" size="pillSm" onClick={() => navigator.clipboard?.writeText(text()).then(() => toast(data.ui["copied"]), () => {})}>{p.copyLabel}</Button>
          <Button variant="quiet" size="pillSm" onClick={() => { setDraft({}); store.del("essay"); }}>{p.clearLabel}</Button>
        </div>
      </PSec>
    </SidePage>
  );
}
