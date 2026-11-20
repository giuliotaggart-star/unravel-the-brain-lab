import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { data } from "@/lib/unravel/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/background")({
  head: () => ({
    meta: [
      { title: "Background: understanding dementia — Unravel" },
      { name: "description", content: "Every scientific report starts with a literature review. Learn what it is, then start yours on dementia." },
      { property: "og:title", content: "Background: understanding dementia — Unravel" },
      { property: "og:description", content: "Start your report the way scientists do: with what is already known." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Background,
});

function Background() {
  const b = (data as any).background;
  return (
    <div>
      <ChapterOpener id="background" heading={b.heading} intro={b.intro}>
        <div className="mt-6 inline-flex max-w-3xl flex-col gap-1 rounded-2xl border-2 border-go bg-go-soft px-6 py-4">
          <span className="kicker text-go">{b.topicLabel}</span>
          <strong className="font-display-tight text-2xl text-go sm:text-3xl">{b.topic}</strong>
        </div>
      </ChapterOpener>
      <PageWrap className="mt-12 space-y-14">
        <section className="space-y-4">
          <h2 className="font-display-tight text-3xl font-medium">{b.whyHeading}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {b.why.map((x: any) => (
              <div key={x.label} className="card-surface flex gap-3 p-5">
                <BookOpen className="mt-0.5 size-5 shrink-0 text-go" aria-hidden />
                <p><strong className="text-go">{x.label}:</strong> {x.text}</p>
              </div>
            ))}
          </div>
        </section>
        <details className="group rounded-2xl border border-border bg-card p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
            <span>{b.outlineToggle}</span>
            <ChevronDown className="size-5 text-go transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-3 text-muted-foreground">{b.outlineNote}</p>
          <ol className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {b.outline.map((x: any, i: number) => (
              <li key={x.part} className={cn("flex items-center gap-4 border-b border-border p-4 last:border-b-0", x.here && "bg-peri-soft")}>
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-sm", x.here ? "bg-go text-go-foreground" : "bg-muted")}>{i + 1}</span>
                <span className="flex-1">
                  <span className="block font-bold">{x.part}</span>
                  <span className="text-sm text-muted-foreground">{x.where}</span>
                </span>
                {x.here && <span className="inline-flex items-center gap-1 rounded-full bg-go px-3 py-1 text-xs font-semibold text-go-foreground"><MapPin className="size-3.5" aria-hidden />{b.hereLabel}</span>}
              </li>
            ))}
          </ol>
        </details>
        <section className="flex flex-col items-start gap-4 rounded-2xl border border-go/30 bg-go-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display-tight text-2xl font-medium text-go">{b.nextHeading}</h2>
            <p className="mt-1">{b.nextLine}</p>
          </div>
          <Button asChild variant="go" size="pill"><Link to="/poll">{b.cta} <ArrowRight className="size-4" /></Link></Button>
        </section>
      </PageWrap>
      <ChapterPager id="background" />
    </div>
  );
}
