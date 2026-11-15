import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/unravel/Shell";
import { Thread } from "@/components/unravel/Thread";
import { data } from "@/lib/unravel/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unravel — A taste of university science" },
      { name: "description", content: "A free research simulation for UK A-level students, starting with Alzheimer's and dementia." },
      { property: "og:title", content: "Unravel — A taste of university science" },
      { property: "og:description", content: "A free research simulation that eases A-level students into real university science." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--coral)_14%,transparent),transparent)]" aria-hidden />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="leading-[0.85]">
          <Brand className="block text-[clamp(4.5rem,17vw,12.5rem)]" />
        </h1>
        <Thread className="max-w-xl" />
        <p className="font-display-tight mt-6 max-w-2xl text-[clamp(1.5rem,3.4vw,2.4rem)] font-normal leading-tight text-foreground">{data.hero["homeLine"]}</p>
        <Button asChild variant="coral" size="pill" className="mt-10 h-12 px-8 text-base">
          <Link to="/about">
            {data.hero["cta"]} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
