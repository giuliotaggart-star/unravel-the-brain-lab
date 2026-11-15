import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { PSec, SidePage } from "@/components/unravel/SidePage";
import { data } from "@/lib/unravel/data";
import imperialLogo from "@/assets/imperial_logo.png.asset.json";
import photo from "@/assets/giulio-taggart.jpg.asset.json";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — Unravel" },
      { name: "description", content: "Meet the Imperial College London student behind Unravel and get in touch." },
      { property: "og:title", content: "Contact us — Unravel" },
      { property: "og:description", content: "Meet the Imperial College London student behind Unravel and get in touch." },
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
        <div className="card-surface overflow-hidden">
          {/* Photo + text side by side; the photo stretches to the text height so neither column has a dead block */}
          <div className="grid lg:grid-cols-[minmax(0,380px)_1fr]">
            <img
              src={photo.url}
              alt={`${c.name} speaking at a lectern`}
              className="aspect-[4/3] w-full object-cover object-top shadow-card lg:aspect-auto lg:h-full"
              loading="lazy"
              decoding="async"
            />
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <div>
                <p className="font-display-tight text-2xl font-semibold text-go-ink sm:text-3xl">{c.name}</p>
                <p className="mt-1.5 text-base leading-snug text-muted-foreground sm:text-lg">{c.role}</p>
              </div>
              <div className="space-y-4">
                {bio.map((p) => (
                  <p key={p} className="text-lg leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Footer band: Imperial logo and email share one row, edge to edge */}
          <div className="flex flex-col items-center gap-4 border-t border-border bg-card px-5 py-5 sm:flex-row sm:justify-between sm:gap-8 sm:px-6">
            <img
              src={imperialLogo.url}
              alt="Imperial College London"
              className="h-auto w-full max-w-[240px] shrink-0 sm:max-w-[340px]"
              loading="lazy"
              decoding="async"
            />
            <a
              href={`mailto:${c.email}`}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-peri/30 bg-peri-soft/50 px-4 py-3 text-sm font-semibold text-go-ink transition-all hover:-translate-y-0.5 hover:border-go/50 sm:w-auto sm:justify-end sm:gap-4 sm:px-6 sm:py-4 sm:text-base"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Mail className="size-5 shrink-0" aria-hidden />
                <span>{c.email}</span>
              </span>
              <ArrowRight className="size-5 shrink-0" aria-hidden />
            </a>
          </div>
        </div>
      </PSec>
    </SidePage>
  );
}
