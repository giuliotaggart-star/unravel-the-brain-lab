import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { data, fill } from "@/lib/unravel/data";
import { useStored } from "@/lib/unravel/store";

export const Route = createFileRoute("/further")({
  head: () => ({
    meta: [
      { title: "Take it further: prize, UCAS and teachers — Unravel" },
      { name: "description", content: "Turn a finding into a £50 essay, write about it for UCAS, or run the lesson with a class." },
      { property: "og:title", content: "Take it further — Unravel" },
      { property: "og:description", content: "The £50 essay prize, UCAS advice and a free teacher lesson." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Further,
});

function Further() {
  const f = data.further;
  const [findings] = useStored<any[] | null>("findings", null);
  const lines: Record<string, string> = Object.fromEntries(f.doors.map((d: any) => [d.page, d.line]));
  lines["prize"] = data.prize.intro;
  const pages = [{ to: "/prize" as const, k: "prize" }, { to: "/ucas" as const, k: "ucas" }, { to: "/teachers" as const, k: "teachers" }];
  return (
    <div>
      <ChapterOpener id="further" heading={f.heading} />
      <PageWrap className="mt-12 space-y-10">
        <div className="card-surface relative overflow-hidden p-8 sm:p-12">
          <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-peri to-coral" />
          <span className="rounded-full bg-coral-soft px-3 py-1 text-sm font-semibold text-coral-ink">{fill(f.prize.badge)}</span>
          <p className="font-display-tight mt-6 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] font-medium leading-tight">{fill(f.prize.heading)}</p>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{fill(findings?.length ? f.prize.bodyAfterWork : f.prize.body)}</p>
          <Button asChild variant="coral" size="pill" className="mt-8"><Link to="/prize">{f.prize.cta} <ArrowRight className="size-4" /></Link></Button>
        </div>
        <div>
          <p className="kicker mb-4">{f.tilesLabel}</p>
          <ul className="grid gap-4 md:grid-cols-3">
            {pages.map((p) => (
              <li key={p.k}>
                <Link to={p.to} className="card-surface group flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
                  <span className="font-display-tight text-2xl font-medium">{data.nav[p.k]}</span>
                  <span className="mt-2 flex-1 text-muted-foreground">{fill(lines[p.k])}</span>
                  <ArrowRight className="mt-6 size-5 text-coral transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PageWrap>
      <ChapterPager id="further" />
    </div>
  );
}
