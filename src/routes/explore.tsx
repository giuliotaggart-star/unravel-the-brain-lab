import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ImageDown } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DonorPlot, StatsTable, type DonorPlotHandle } from "@/components/unravel/DonorPlot";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { cellColourVar, cellOf, data, fill, groupingOf, isText, label, num, seriesOf } from "@/lib/unravel/data";
import { composeCard, fileStem, saveBlob } from "@/lib/unravel/exportPng";
import { buildQuestion, enoughDonors, foldWords, minDonors, questionText, questionVars } from "@/lib/unravel/stats";
import { useStored } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore: ask your own question — Unravel" },
      { name: "description", content: "Pick a measure, a pathology grouping and a cell type, and see every donor as one dot." },
      { property: "og:title", content: "Explore: ask your own question — Unravel" },
      { property: "og:description", content: "An interactive query builder over real SEA-AD donor data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

interface Sb { metric: string; cellType: string; grouping: string }

function Explore() {
  const lab = data.lab;
  const ex = data.explore;
  const pads: any[] = lab.launchpads;
  const first = pads[0];
  const [sb, setSb] = useStored<Sb>("sandbox", { metric: first.metric, cellType: first.cellType, grouping: first.grouping });
  const [made, setMade] = useState(false);
  const plot = useRef<DonorPlotHandle>(null);
  const metrics = data.metrics.filter((m) => data.series.some((x) => x.metric === m.id));
  const cellsFor = (mid: string) => data.cellTypes.filter((c) => seriesOf(mid, c.id));
  const metric = metrics.some((m) => m.id === sb.metric) ? sb.metric : metrics[0]!.id;
  const cellType = cellsFor(metric).some((c) => c.id === sb.cellType) ? sb.cellType : cellsFor(metric)[0]!.id;
  const grouping = groupingOf(sb.grouping) ? sb.grouping : data.groupings[0]!.id;
  const Q = buildQuestion({ metric, cellType, grouping });
  const set = (p: Partial<Sb>) => { setMade(false); setSb({ metric, cellType, grouping, ...p }); };
  const vars = questionVars(Q);
  const b = lab.builder;
  const sel = "mx-1 inline-block rounded-xl border border-border bg-card px-3 py-1.5 text-base font-semibold text-peri-ink shadow-card outline-none focus-visible:ring-2 focus-visible:ring-peri/40";
  const d = Q?.d ?? NaN;
  const size = !Number.isFinite(d) ? "" : Math.abs(d) < 0.2 ? lab.effectWords.none : Math.abs(d) < 0.5 ? lab.effectWords.small : Math.abs(d) < 0.8 ? lab.effectWords.moderate : lab.effectWords.large;
  const save = async (stats: boolean) => {
    if (!Q || !plot.current?.svg) return;
    try { saveBlob(await composeCard(Q, plot.current.svg, stats), fileStem(Q) + (stats ? "-snapshot" : "") + ".png"); } catch { /* picture could not be made */ }
    if (stats) setMade(true);
  };
  return (
    <div>
      <ChapterOpener id="explore" heading={ex.heading} intro={ex.intro} />
      <PageWrap className="mt-12 space-y-8">
        <ul className="grid gap-3 md:grid-cols-3">
          {pads.map((p) => {
            const on = p.metric === metric && p.cellType === cellType && p.grouping === grouping;
            return (
              <li key={p.id}>
                <button type="button" aria-pressed={on} onClick={() => set({ metric: p.metric, cellType: p.cellType, grouping: p.grouping })} className={cn("card-surface flex w-full flex-col gap-1 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift", on && "border-peri ring-2 ring-peri/20")}>
                  <span className="kicker" style={{ color: `color-mix(in oklab, ${cellColourVar(p.cellType)} 80%, var(--foreground))` }}>{label(cellOf(p.cellType))}</span>
                  <span className="font-semibold">{p.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="card-surface space-y-6 p-6 sm:p-8">
          <p className="font-display-tight text-[clamp(1.3rem,2.6vw,1.9rem)] leading-[1.9]">
            {b.lead}
            <select aria-label={b.lead} className={sel} value={metric} onChange={(e) => set({ metric: e.target.value })}>
              {metrics.map((m) => <option key={m.id} value={m.id}>{label(m)}</option>)}
            </select>
            {b.mid1}
            <select aria-label={b.mid1} className={sel} value={grouping} onChange={(e) => set({ grouping: e.target.value })}>
              {data.groupings.map((g) => <option key={g.id} value={g.id}>{label(g)}</option>)}
            </select>
            {b.mid2} <span className="font-semibold">{label(cellOf(cellType))}</span>
            {b.end}
          </p>
          <div className="space-y-2">
            <p className="kicker">{ex.cellLabel}</p>
            <div role="radiogroup" aria-label={ex.cellLabel} className="flex flex-wrap gap-2">
              {cellsFor(metric).map((c) => {
                const on = c.id === cellType;
                return (
                  <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => set({ cellType: c.id })} className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all", on ? "border-foreground/20 bg-card shadow-card" : "border-border bg-muted/50 text-muted-foreground hover:text-foreground")}>
                    <span className="size-2.5 rounded-full" style={{ background: cellColourVar(c.id) }} /> {label(c)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {Q && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <figure className="card-surface min-w-0 space-y-4 p-5 sm:p-8">
              <figcaption className="font-display-tight text-2xl font-medium">{questionText(Q)}</figcaption>
              {isText(Q.grouping.explainer) && <p className="text-sm text-muted-foreground">{Q.grouping.explainer}</p>}
              <DonorPlot ref={plot} Q={Q} colour="groups" />
              <dl className="grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
                {(["look", "shows", "matters"] as const).map((k) => (
                  <div key={k}>
                    <dt className="kicker">{lab.explainLabels[k]}</dt>
                    <dd className="mt-1 text-sm leading-relaxed">{fill(ex.explain[k], vars)}</dd>
                  </div>
                ))}
              </dl>
              <details className="group rounded-xl border border-border bg-surface p-4">
                <summary className="cursor-pointer font-semibold">{lab.curiousLabel}</summary>
                <div className="mt-3 space-y-3 text-sm">
                  <p className="text-muted-foreground">{lab.dotNote}</p>
                  {isText(Q.grouping.drawerLine) && <p className="text-muted-foreground">{Q.grouping.drawerLine}</p>}
                  {enoughDonors(Q) ? (
                    <>
                      {Number.isFinite(d) && <p><span className="kicker">{lab.dLabel}</span> {num(d, 2)} {lab.effectUnit}. {size}. {fill(lab.dNote, vars)}</p>}
                      {Q.mw && <p><span className="kicker">{lab.uLabel}</span> {num(Q.mw.u, 1)}. <span className="kicker">{lab.uPLabel}</span> {Q.mw.p < 0.001 ? "< 0.001" : num(Q.mw.p, 3)}. {fill(lab.uNote, vars)}</p>}
                    </>
                  ) : <p>{fill(lab.tooFewNote, { ...vars, minDonors: String(minDonors()) })}</p>}
                  <p><span className="kicker">{lab.sizesLabel}</span> {fill(lab.sizesNote, vars)}</p>
                  <p className="kicker">{lab.statsHeading}</p>
                  <StatsTable Q={Q} />
                </div>
              </details>
            </figure>
            <aside className="space-y-4">
              <div className="card-surface p-5">
                <p className="kicker">{fill(lab.effectLabel, vars)}</p>
                <p className="font-display-tight mt-2 text-2xl font-medium">{!enoughDonors(Q) ? lab.tooFewLabel : !Number.isFinite(Q.fold) ? lab.noRatioLabel : foldWords(Q.fold)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{!enoughDonors(Q) ? fill(lab.tooFewNote, { ...vars, minDonors: String(minDonors()) }) : !Number.isFinite(Q.fold) ? fill(lab.noRatioNote, vars) : fill(lab.effectNote, vars)}</p>
              </div>
              <Button variant="coral" size="pill" className="w-full" onClick={() => save(true)}><ImageDown className="size-4" /> {lab.snapshotLabel}</Button>
              <Button variant="soft" size="pill" className="w-full" onClick={() => save(false)}><Download className="size-4" /> {lab.exportLabel}</Button>
              {made && (
                <div role="status" className="rounded-2xl border border-coral/30 bg-coral-soft/60 p-4 text-sm">
                  <p>{lab.snapshotDone}</p>
                  <Link to="/prize" className="mt-1 inline-block font-semibold text-coral-ink hover:underline">{fill(lab.snapshotBridge)} →</Link>
                </div>
              )}
            </aside>
          </div>
        )}
      </PageWrap>
      <ChapterPager id="explore" />
    </div>
  );
}
