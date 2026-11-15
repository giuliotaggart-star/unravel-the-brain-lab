import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GfxCellGroups, GfxCellsDisease, GfxOneAtATime, GfxSymptoms, SceneSvg } from "@/components/unravel/InsightGraphics";
import { Knot } from "@/components/unravel/Knot";
import { GlossaryScope, Rich } from "@/components/unravel/Rich";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { data } from "@/lib/unravel/data";
import { useReducedMotion } from "@/lib/unravel/store";
import type { Insight } from "@/lib/unravel/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/what-dementia-is")({
  head: () => ({
    meta: [
      { title: "What dementia really is — Unravel" },
      { name: "description", content: "Dementia versus Alzheimer's, amyloid and tau, the brain's cell types and why scientists read cells one at a time." },
      { property: "og:title", content: "What dementia really is — Unravel" },
      { property: "og:description", content: "Four common misunderstandings about dementia, unravelled with clear interactive graphics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pivot,
});

function Graphic({ it }: { it: Insight }) {
  if (it.id === "symptoms") return <GfxSymptoms g={it.graphic} />;
  if (it.id === "cells-disease") return <GfxCellsDisease g={it.graphic} />;
  if (it.id === "cells") return <GfxCellGroups g={it.graphic} />;
  if (it.id === "one-at-a-time") return <GfxOneAtATime g={it.graphic} />;
  return null;
}

function Pivot() {
  const items = data.insights;
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const it = items[i]!;
  const last = i === items.length - 1;
  const go = (k: number) => {
    setI(k);
    const el = document.getElementById("insight-panel");
    if (el && el.getBoundingClientRect().top < 64) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };
  return (
    <div>
      <ChapterOpener id="pivot" />
      <PageWrap className="mt-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <nav aria-label={data.sections.find((s) => s.id === "pivot")?.name} className="lg:sticky lg:top-24 lg:self-start">
            <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {items.map((x, k) => (
                <li key={x.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => go(k)}
                    aria-current={k === i ? "step" : undefined}
                    className={cn(
                      "flex w-56 items-start gap-3 rounded-2xl border p-3 text-left transition-all lg:w-full",
                      k === i ? "border-border bg-card shadow-card" : "border-transparent text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs", k === i ? "bg-foreground text-background" : "bg-muted")}>{k + 1}</span>
                    <span className="text-sm font-semibold leading-snug">{x.headline}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div id="insight-panel" className="scroll-mt-24">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={it.id}
                initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="card-surface overflow-hidden"
              >
                <GlossaryScope>
                  <div className="px-6 pt-8 sm:px-10">
                    <p className="flex flex-col gap-1.5 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-3">
                      <span className="font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">{data.pivot["mythLabel"]}:</span>
                      <span className="italic text-muted-foreground">{it.myth}</span>
                    </p>
                  </div>
                  <div className="grid gap-10 px-6 py-8 sm:px-10 sm:py-10 xl:grid-cols-2">
                    <div className="space-y-5">
                      <h2 className="font-display-tight text-[clamp(1.9rem,3.6vw,2.8rem)] font-medium leading-[1.08]">{it.headline}</h2>
                      <Rich as="p" text={it.body} className="text-[1.08rem] leading-[1.75] text-foreground/85" />
                      {it.knot && (
                        <Knot label={it.knot.label} title={it.knot.title} className="pt-2">
                          <Rich as="p" text={it.knot.body} />
                          {it.knot.steps && (
                            <div className="grid gap-3 pt-1 sm:grid-cols-2">
                              {it.knot.steps.map((s) => (
                                <figure key={s.scene} className="space-y-2">
                                  <SceneSvg scene={s.scene} />
                                  <figcaption className="text-sm text-foreground/80">{s.caption}</figcaption>
                                </figure>
                              ))}
                            </div>
                          )}
                        </Knot>
                      )}
                    </div>
                    <figure aria-label={it.alt} className="min-w-0">
                      <Graphic it={it} />
                    </figure>
                  </div>
                </GlossaryScope>
                <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4 sm:px-10">
                  <span className="font-mono text-xs text-muted-foreground">
                    {i + 1} / {items.length}
                  </span>
                  {last ? (
                    <Button asChild variant="go" size="pill">
                      <Link to="/data">
                        {it.nextLabel ?? data.pivot["nextLabel"]} <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="go" size="pill" onClick={() => go(i + 1)}>
                      {data.pivot["nextLabel"]} <ArrowRight className="size-4" />
                    </Button>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </PageWrap>
      <ChapterPager id="pivot" />
    </div>
  );
}
