import { createFileRoute } from "@tanstack/react-router";
import { PSec, SidePage, Ticks } from "@/components/unravel/SidePage";
import { data, isUrl } from "@/lib/unravel/data";

export const Route = createFileRoute("/ucas")({
  head: () => ({
    meta: [
      { title: "UCAS and careers — Unravel" },
      { name: "description", content: "How to write about a research project on your UCAS application, and what computational biology is." },
      { property: "og:title", content: "UCAS and careers — Unravel" },
      { property: "og:description", content: "Writing about a project for admissions tutors, and paths into computational biology." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ucas,
});

function Ucas() {
  const u = data.ucas;
  return (
    <SidePage heading={u.heading} intro={u.intro}>
      <PSec title={u.statementHeading}>
        <p>{u.statementIntro}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card-surface p-5"><p className="kicker text-coral-ink">{u.weakLabel}</p><blockquote className="mt-2">{u.weak}</blockquote></div>
          <div className="card-surface border-good/40 p-5"><p className="kicker text-good">{u.strongLabel}</p><blockquote className="mt-2">{u.strong}</blockquote></div>
        </div>
        <p className="rounded-xl bg-coral-soft p-4 text-coral-ink">{u.statementWarning}</p>
        <p className="kicker">{u.statementWhyHeading}</p>
        <Ticks items={u.statementWhy} />
      </PSec>
      <PSec title={u.compHeading}>
        {u.comp.map((p: string) => <p key={p}>{p}</p>)}
        {isUrl(u.compLink?.url) && <a href={u.compLink.url} target="_blank" rel="noopener" className="font-semibold text-peri-ink hover:underline">{u.compLink.label} ↗</a>}
      </PSec>
      <PSec title={u.founderHeading}>
        <blockquote className="card-surface space-y-3 p-6">
          {u.founder.map((p: string) => <p key={p}>{p}</p>)}
          <footer className="kicker">{u.founderSign}</footer>
        </blockquote>
      </PSec>
    </SidePage>
  );
}
