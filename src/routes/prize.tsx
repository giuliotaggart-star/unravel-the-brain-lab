import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PSec, SidePage, Ticks } from "@/components/unravel/SidePage";
import { data, fill, isText, isUrl } from "@/lib/unravel/data";
import { store } from "@/lib/unravel/store";

export const Route = createFileRoute("/prize")({
  head: () => ({
    meta: [
      { title: "The £50 essay prize — Unravel" },
      { name: "description", content: "Turn any finding from the Data Lab into a 400–500 word essay. Every entry gets personal feedback." },
      { property: "og:title", content: "The £50 essay prize — Unravel" },
      { property: "og:description", content: "Claim, evidence, reasoning: build your essay on real SEA-AD data." },
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
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => setDraft(store.get<Record<string, string>>("essay") || {}), []);
  const update = (id: string, v: string) => setDraft((d) => { const n = { ...d, [id]: v }; store.set("essay", n); return n; });
  const total = p.sections.reduce((a: number, s: any) => a + words(draft[s.id] || ""), 0);
  const hasDeadline = isText(cfg["essayDeadline"]) && cfg["essayDeadline"] !== "PLACEHOLDER";
  const text = () => p.sections.map((s: any) => `${s.label}\n${(draft[s.id] || "").trim()}`).join("\n\n");
  return (
    <SidePage gold heading={fill(p.heading)} intro={p.intro}>
      <PSec title={p.submitHeading}>
        {isUrl(cfg["essayFormUrl"]) ? (
          <Button asChild variant="gold" size="pill"><a href={cfg["essayFormUrl"]} target="_blank" rel="noopener">{p.submitLabel} ↗</a></Button>
        ) : (
          <div className="space-y-2"><Button variant="gold" size="pill" disabled>{p.submitLabel}</Button><p className="text-sm text-muted-foreground">{p.submitPending}</p></div>
        )}
        {p.submitPrivacy.map((x: string) => <p key={x} className="text-sm text-muted-foreground">{x}</p>)}
      </PSec>
      <PSec title={p.builderHeading}>
        <p>{p.builderIntro}</p>
        <p className="text-sm text-muted-foreground">{p.originalityNote}</p>
        {p.sections.map((s: any) => {
          const c = words(draft[s.id] || "");
          return (
            <div key={s.id} className="card-surface space-y-2 p-5">
              <label htmlFor={"essay-" + s.id} className="kicker">{s.label}</label>
              <p className="text-sm text-muted-foreground">{s.prompt}</p>
              <textarea id={"essay-" + s.id} rows={Math.max(4, Math.round(s.target / 22))} value={draft[s.id] || ""} onChange={(e) => update(s.id, e.target.value)} className="w-full rounded-xl border border-input bg-card p-3 outline-none focus-visible:border-peri focus-visible:ring-2 focus-visible:ring-peri/30" />
              <p className="text-xs text-muted-foreground">{fill(p.wordCount, { count: c, target: s.target })}</p>
            </div>
          );
        })}
        <p className="sticky bottom-4 rounded-full border border-border bg-card/95 px-4 py-2 text-center text-sm font-medium shadow-lift backdrop-blur">{fill(p.totalCount, { count: total })}</p>
        <div className="card-surface p-5"><p className="kicker mb-3">{p.checklistHeading}</p><Ticks items={p.checklist} /></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="soft" size="pillSm" onClick={() => navigator.clipboard?.writeText(text()).then(() => toast(data.ui["copied"]), () => {})}>{p.copyLabel}</Button>
          <Button variant="quiet" size="pillSm" onClick={() => { setDraft({}); store.del("essay"); }}>{p.clearLabel}</Button>
        </div>
      </PSec>
      <PSec title={p.rubricHeading}>
        <p className="text-sm text-muted-foreground">{p.rubricNote}</p>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/60"><tr><th className="px-3 py-2 text-left">{p.rubricCriterionLabel}</th>{p.rubricLevels.map((l: string) => <th key={l} className="px-3 py-2 text-left">{l}</th>)}</tr></thead>
            <tbody>{p.rubric.map((r: any) => <tr key={r.criterion} className="border-t border-border align-top"><th className="px-3 py-2 text-left font-semibold">{r.criterion}</th>{r.levels.map((x: string) => <td key={x} className="px-3 py-2">{x}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </PSec>
      <PSec title={p.rulesHeading}>
        <Ticks items={p.rules.map((r: string) => fill(r))} />
        {hasDeadline && <p>{fill(p.deadlineLabel)}</p>}
      </PSec>
    </SidePage>
  );
}
