import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalContent } from "@/components/unravel/LegalPage";
import { data } from "@/lib/unravel/data";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Competition terms — Unravel" },
      { name: "description", content: "Rules for the Unravel abstract competition: who can enter, judging, the prize and your entry." },
      { property: "og:title", content: "Competition terms — Unravel" },
      { property: "og:description", content: "Who can enter, how entries are judged and how the prize is sent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LegalPage c={(data as any).termsPage as LegalContent} />,
});
