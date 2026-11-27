import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail, UserRound } from "lucide-react";
import { PSec, SidePage } from "@/components/unravel/SidePage";
import { data } from "@/lib/unravel/data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — Unravel" },
      { name: "description", content: "Meet Unravel’s founder Giulio Taggart and co-founder Solly McNay, and get in touch." },
      { property: "og:title", content: "Contact us — Unravel" },
      { property: "og:description", content: "Meet Unravel’s founder Giulio Taggart and co-founder Solly McNay, and get in touch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const c = (data as any).contact;
  const bio: string[] = Array.isArray(c.bio) ? c.bio : [c.bio];
  return (
    <SidePage heading={c.heading} intro={c.intro}>
      <PSec>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <article className="min-w-0">
            <img
              src={`${import.meta.env.BASE_URL}giulio-taggart-full.jpg`}
              alt={c.name}
              className="block aspect-[4/5] w-full rounded-lg bg-surface object-contain"
              loading="lazy"
              decoding="async"
            />
            <p className="mt-4 text-sm font-semibold text-go-ink">{c.founderTitle}</p>
            <h2 className="mt-1 font-display-tight text-xl font-semibold text-go-ink sm:text-3xl">{c.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{c.role}</p>
          </article>
          <article className="min-w-0">
            {c.coFounder.photo ? (
              <img src={c.coFounder.photo} alt={c.coFounder.name} className="block aspect-[4/5] w-full rounded-lg bg-surface object-contain" loading="lazy" decoding="async" />
            ) : (
              <div role="img" aria-label={c.coFounder.photoLabel} className="flex aspect-[4/5] w-full items-center justify-center rounded-lg border border-dashed border-peri/40 bg-peri-soft/50">
                <UserRound className="size-16 text-peri sm:size-24" strokeWidth={1} aria-hidden />
              </div>
            )}
            <p className="mt-4 text-sm font-semibold text-go-ink">{c.coFounder.title}</p>
            <h2 className="mt-1 font-display-tight text-xl font-semibold text-go-ink sm:text-3xl">{c.coFounder.name}</h2>
          </article>
        </div>
        <div className="mt-8 border-t border-border pt-8">
              <h2 className="font-display-tight text-2xl font-semibold text-go-ink sm:text-3xl">{c.missionHeading}</h2>
              <div className="mt-4 space-y-4">
                {bio.map((p) => (
                  <p key={p} className="text-lg leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              <a
                href={`mailto:${c.email}`}
                className="mt-6 flex w-full items-center justify-between gap-3 rounded-lg border border-peri/30 bg-peri-soft/50 px-4 py-3 text-sm font-semibold text-go-ink transition-all hover:-translate-y-0.5 hover:border-go/50 sm:gap-4 sm:px-5 sm:py-4 sm:text-base"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Mail className="size-5 shrink-0" aria-hidden />
                   <span className="break-all">{c.email}</span>
                </span>
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </a>
        </div>
      </PSec>
    </SidePage>
  );
}
