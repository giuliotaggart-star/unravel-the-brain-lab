import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { PSec, SidePage } from "@/components/unravel/SidePage";
import { data } from "@/lib/unravel/data";

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
          <div className="grid lg:grid-cols-[minmax(0,420px)_1fr]">
            {/* The whole photo, uncropped, down the left side */}
            <img
              src={`${import.meta.env.BASE_URL}giulio-taggart-full.jpg`}
              alt={`${c.name} speaking at a lectern`}
              className="block h-auto w-full"
              loading="lazy"
              decoding="async"
            />

            {/* Imperial logo at the top, name and profile below it */}
            <div className="flex flex-col gap-5 bg-card p-6 sm:p-8">
              <img
                src={`${import.meta.env.BASE_URL}imperial-wordmark.png`}
                alt="Imperial College London"
                className="h-auto w-full max-w-[320px]"
                loading="lazy"
                decoding="async"
              />
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
              <a
                href={`mailto:${c.email}`}
                className="mt-auto flex w-full items-center justify-between gap-3 rounded-2xl border border-peri/30 bg-peri-soft/50 px-4 py-3 text-sm font-semibold text-go-ink transition-all hover:-translate-y-0.5 hover:border-go/50 sm:gap-4 sm:px-5 sm:py-4 sm:text-base"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Mail className="size-5 shrink-0" aria-hidden />
                  <span>{c.email}</span>
                </span>
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </PSec>
    </SidePage>
  );
}
