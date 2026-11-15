import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Mail } from "lucide-react";
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
  return (
    <SidePage heading={c.heading} intro={c.intro}>
      <PSec>
        <div className="card-surface flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-go text-go-foreground shadow-lift">
            <GraduationCap className="size-8" aria-hidden />
          </span>
          <div className="space-y-3">
            <div>
              <p className="font-display-tight text-2xl font-semibold text-go-ink">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.role}</p>
            </div>
            <p className="leading-relaxed">{c.bio}</p>
            <img src={imperialLogo.url} alt="Imperial College London" className="h-7 w-auto" />
          </div>
        </div>
      </PSec>
      <PSec title={c.emailLabel}>
        <a
          href={`mailto:${c.email}`}
          className="card-surface inline-flex items-center gap-3 px-5 py-4 font-semibold text-go-ink transition-all hover:-translate-y-0.5 hover:border-go/50"
        >
          <Mail className="size-5" aria-hidden />
          {c.email}
        </a>
      </PSec>
    </SidePage>
  );
}
