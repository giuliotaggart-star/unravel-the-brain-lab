import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PSec, SidePage, Ticks } from "@/components/unravel/SidePage";
import { data, isUrl } from "@/lib/unravel/data";

export const Route = createFileRoute("/teachers")({
  head: () => ({
    meta: [
      { title: "For teachers — Unravel" },
      { name: "description", content: "A free 50-minute workshop on Alzheimer's disease and gene expression for Year 12 and 13." },
      { property: "og:title", content: "For teachers — Unravel" },
      { property: "og:description", content: "No preparation, nothing to install: a lesson built on real research data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Teachers,
});

function Teachers() {
  const t = data.teachers;
  const cfg = data.config;
  return (
    <SidePage heading={t.heading} intro={t.intro}>
      <PSec title={t.valueHeading}><Ticks items={t.value} /></PSec>
      <PSec title={t.curriculumHeading}>
        <ul className="grid gap-4 md:grid-cols-2">
          {t.curriculum.map((c: any) => (
            <li key={c.spec} className="card-surface space-y-3 p-5">
              {isUrl(c.url) ? <a href={c.url} target="_blank" rel="noopener" className="font-semibold text-peri-ink hover:underline">{c.spec} ↗</a> : <p className="font-semibold">{c.spec}</p>}
              <Ticks items={c.topics} />
            </li>
          ))}
        </ul>
      </PSec>
      <PSec title={t.sensitivityHeading}><p>{t.sensitivity}</p></PSec>
      <PSec title={t.packHeading}>
        <p>{t.packBody}</p>
        {isUrl(cfg["teacherFormUrl"]) ? (
          <Button asChild variant="coral" size="pill"><a href={cfg["teacherFormUrl"]} target="_blank" rel="noopener">{t.packLabel} ↗</a></Button>
        ) : (
          <div className="space-y-2"><Button variant="coral" size="pill" disabled>{t.packLabel}</Button><p className="text-sm text-muted-foreground">{t.packPending}</p></div>
        )}
      </PSec>
      <PSec title={t.codeHeading}>
        <ol className="space-y-3">
          {t.code.map((x: string, i: number) => (
            <li key={i} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-coral/40 font-mono text-xs text-coral-ink">{i + 1}</span>{x}</li>
          ))}
        </ol>
      </PSec>
    </SidePage>
  );
}
