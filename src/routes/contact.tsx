import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { PSec, SidePage } from "@/components/unravel/SidePage";
import { data } from "@/lib/unravel/data";
import imperialLogo from "@/assets/imperial_logo.png.asset.json";

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
          <div className="flex items-center justify-center border-b border-border bg-card px-6 py-12 sm:py-16">
            <img src={imperialLogo.url} alt="Imperial College London" className="h-24 w-auto sm:h-32" />
          </div>
          <div className="space-y-5 p-6 sm:p-8">
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
      </PSec>
      <PSec title={c.emailLabel}>
        <a
          href={`mailto:${c.email}`}
          className="card-surface flex items-center justify-between gap-4 px-6 py-5 text-lg font-semibold text-go-ink transition-all hover:-translate-y-0.5 hover:border-go/50"
        >
          <span className="flex items-center gap-3">
            <Mail className="size-5" aria-hidden />
            {c.email}
          </span>
          <ArrowRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        </a>
      </PSec>
    </SidePage>
  );
}
