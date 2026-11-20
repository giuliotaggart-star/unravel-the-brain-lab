import { PageWrap } from "@/components/unravel/Shell";

export interface LegalContent { kicker: string; title: string; intro: string; updated: string; sections: { heading: string; body: string[] }[] }

/** A plain reading page for the privacy notice and competition terms. */
export function LegalPage({ c }: { c: LegalContent }) {
  return (
    <PageWrap className="py-14 sm:py-20">
      <article className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-3">
          <p className="kicker">{c.kicker}</p>
          <h1 className="font-display-tight text-4xl font-medium sm:text-5xl">{c.title}</h1>
          <p className="text-lg text-muted-foreground">{c.intro}</p>
          <p className="font-mono text-xs text-muted-foreground">{c.updated}</p>
        </header>
        {c.sections.map((s) => (
          <section key={s.heading} className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display-tight text-2xl font-medium">{s.heading}</h2>
            {s.body.map((p) => <p key={p} className="leading-relaxed text-foreground/85">{p}</p>)}
          </section>
        ))}
      </article>
    </PageWrap>
  );
}
