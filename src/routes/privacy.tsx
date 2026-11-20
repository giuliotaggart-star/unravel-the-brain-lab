import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalContent } from "@/components/unravel/LegalPage";
import { data } from "@/lib/unravel/data";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy notice — Unravel" },
      { name: "description", content: "What Unravel collects, why, how long it is kept and how to ask for deletion." },
      { property: "og:title", content: "Privacy notice — Unravel" },
      { property: "og:description", content: "No cookies, no names: how Unravel handles poll answers and competition entries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LegalPage c={(data as any).privacyPage as LegalContent} />,
});
