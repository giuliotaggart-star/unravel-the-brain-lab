import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlossaryScope, Rich } from "@/components/unravel/Rich";
import { ChapterOpener, ChapterPager, PageWrap } from "@/components/unravel/Shell";
import { data, fill } from "@/lib/unravel/data";
import { useReducedMotion } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: "Where the data comes from — Unravel" },
      { name: "description", content: "From brain donation to one dot on a chart: how the SEA-AD middle temporal gyrus data was made." },
      { property: "og:title", content: "Where the data comes from — Unravel" },
      { property: "og:description", content: "Follow the donor journey behind every dot in the lab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DataJourney,
});

const BRAIN = "M70 150 C 40 120, 50 70, 100 52 C 140 30, 200 28, 250 40 C 310 50, 350 80, 352 124 C 354 160, 330 184, 296 192 C 280 214, 240 222, 214 206 C 190 222, 150 220, 132 200 C 104 200, 84 180, 70 150 Z";
const LOBE = "M132 200 C 150 220, 190 222, 214 206 C 240 222, 280 214, 296 192 C 270 172, 220 168, 180 172 C 156 176, 140 186, 132 200 Z";

function Scene({ step }: { step: number }) {
  const labels = data.video.brainLabels;
  const order: string[] = data.groupings.find((g) => g.id === "adnc")!.order;
  const counts = order.map((o) => data.donors.filter((d) => d.adnc === o).length);
  const maxC = Math.max(...counts);
  const nuclei = Array.from({ length: 42 }, (_, i) => ({ x: 120 + (i % 7) * 26 + ((Math.floor(i / 7) % 2) * 12), y: 70 + Math.floor(i / 7) * 24, hit: (i * 5) % 7 === 0 }));
  const sp = { type: "spring" as const, stiffness: 160, damping: 20 };
  return (
    <svg viewBox="0 0 420 260" className="h-full w-full" role="img" aria-label={data.dataSteps[step]?.alt}>
      {(step === 0 || step === 2) && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <path d={BRAIN} fill="var(--peri-soft)" stroke="var(--peri)" strokeWidth={2.5} />
          <path d="M120 90 C 150 110, 190 80, 230 100 M160 140 C 200 130, 240 150, 300 130 M240 60 C 250 90, 280 90, 300 80" fill="none" stroke="var(--peri)" strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />
          <path d={LOBE} fill="var(--coral)" fillOpacity={step === 0 ? 0.25 : 0.12} stroke="var(--coral)" strokeWidth={2} />
          <text x={250} y={244} fontSize={12} fontWeight={600} fill="var(--coral-ink)">{labels.lobe}</text>
          {step === 2 && (
            <>
              <motion.rect width={34} height={26} rx={5} fill="var(--coral)" initial={{ x: 200, y: 180 }} animate={{ x: 316, y: 40 }} transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }} />
              <motion.path d="M217 192 C 260 150, 300 90, 330 66" fill="none" stroke="var(--coral)" strokeDasharray="3 6" strokeWidth={2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
              <text x={300} y={28} fontSize={12} fontWeight={600} fill="var(--foreground)">{labels.sample}</text>
            </>
          )}
        </motion.g>
      )}
      {step === 1 && (
        <g>
          {order.map((o, i) => {
            const x = 60 + i * 84;
            const h = (counts[i]! / maxC) * 160;
            return (
              <g key={o}>
                <rect x={x} y={40} width={56} height={170} rx={10} fill="var(--muted)" />
                <motion.rect x={x} width={56} rx={10} fill={`color-mix(in oklab, var(--peri) ${100 - i * 33}%, var(--coral))`} initial={{ y: 210, height: 0 }} animate={{ y: 210 - h, height: h }} transition={{ ...sp, delay: i * 0.15 }} />
                <motion.text x={x + 28} y={200 - h} textAnchor="middle" fontSize={16} fontWeight={700} fill="var(--foreground)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.15 }}>
                  {counts[i]}
                </motion.text>
                <text x={x + 28} y={232} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--foreground)">{o}</text>
              </g>
            );
          })}
        </g>
      )}
      {step === 3 && (
        <g>
          {nuclei.map((n, i) => (
            <motion.circle key={i} r={8} fill={n.hit ? "var(--coral)" : "var(--peri)"} fillOpacity={n.hit ? 0.95 : 0.45} initial={{ cx: 210, cy: 130, opacity: 0 }} animate={{ cx: n.x, cy: n.y, opacity: 1 }} transition={{ ...sp, delay: i * 0.015 }} />
          ))}
        </g>
      )}
      {step === 4 && (
        <g>
          <motion.circle cx={140} cy={130} r={70} fill="var(--peri-soft)" stroke="var(--peri)" strokeWidth={2.5} initial={{ scale: 0.4 }} animate={{ scale: 1 }} style={{ transformOrigin: "140px 130px" }} transition={sp} />
          {Array.from({ length: 9 }, (_, i) => (
            <motion.path
              key={i}
              d={`M${100 + (i % 3) * 28} ${96 + Math.floor(i / 3) * 26} q 6 -8 12 0 t 12 0`}
              fill="none"
              stroke={i % 4 === 0 ? "var(--coral)" : "var(--peri)"}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            />
          ))}
          {[0, 1, 2].map((r) => (
            <motion.g key={r} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + r * 0.15 }}>
              <rect x={250} y={70 + r * 46} width={130} height={34} rx={8} fill="var(--card)" stroke="var(--border)" />
              <rect x={262} y={82 + r * 46} width={[78, 46, 22][r]} height={10} rx={5} fill={r === 0 ? "var(--coral)" : "var(--peri)"} />
            </motion.g>
          ))}
        </g>
      )}
      {step === 5 && (
        <g>
          <line x1={250} y1={40} x2={250} y2={220} stroke="var(--foreground)" strokeOpacity={0.35} strokeWidth={1.5} />
          <line x1={250} y1={220} x2={400} y2={220} stroke="var(--foreground)" strokeOpacity={0.35} strokeWidth={1.5} />
          {Array.from({ length: 14 }, (_, i) => (
            <motion.circle key={i} r={6} fill="var(--peri)" initial={{ cx: 60 + (i % 5) * 26, cy: 80 + Math.floor(i / 5) * 30, opacity: 1 }} animate={{ cx: 160, cy: 130, opacity: 0 }} transition={{ duration: 0.8, delay: i * 0.03, ease: [0.65, 0, 0.35, 1] }} />
          ))}
          <motion.circle r={11} fill="var(--coral)" initial={{ cx: 160, cy: 130, opacity: 0 }} animate={{ cx: [160, 160, 320], cy: [130, 130, 150], opacity: [0, 1, 1] }} transition={{ duration: 1.6, times: [0, 0.5, 1], delay: 0.6 }} />
          {[[280, 120], [300, 170], [350, 110], [370, 160]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="var(--peri)" fillOpacity={0.35} />)}
        </g>
      )}
    </svg>
  );
}

function DataJourney() {
  const steps = data.dataSteps;
  const v = data.video;
  const [k, setK] = useState(0);
  const reduced = useReducedMotion();
  const last = k === steps.length - 1;
  return (
    <div>
      <ChapterOpener id="video" heading={v.heading} />
      <PageWrap className="mt-12">
        <div className="card-surface overflow-hidden">
          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            <div className="dot-grid relative aspect-[420/260] border-b border-border bg-surface lg:aspect-auto lg:min-h-[440px] lg:border-b-0 lg:border-r">
              <AnimatePresence mode="wait">
                <motion.div key={k} className="absolute inset-0 p-6 sm:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}>
                  <Scene step={k} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex flex-col p-6 sm:p-10">
              <ol className="flex gap-1.5" aria-hidden>
                {steps.map((_, i) => (
                  <li key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", i <= k ? "bg-coral" : "bg-muted")} />
                ))}
              </ol>
              <p className="kicker mt-6">{fill(v.stepLabel, { n: k + 1, total: steps.length })}</p>
              <div className="relative mt-3 min-h-[9rem] flex-1">
                <AnimatePresence mode="wait">
                  <motion.div key={k} initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -6 }} transition={{ duration: 0.3 }}>
                    <GlossaryScope>
                      <Rich as="p" text={steps[k]!.caption} className="font-display-tight text-[clamp(1.4rem,2.6vw,2rem)] font-normal leading-snug" />
                    </GlossaryScope>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-8 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0} className="inline-flex items-center gap-1.5 text-sm font-medium text-peri-ink hover:underline disabled:invisible">
                  <ArrowLeft className="size-4" /> {data.poll.backLabel}
                </button>
                {last ? (
                  <Button asChild variant="go" size="pill">
                    <Link to="/lab">
                      {v.finalLabel} <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="go" size="pill" onClick={() => setK((x) => x + 1)}>
                    {v.nextLabel} <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{fill(v.footnote)}</p>
      </PageWrap>
      <ChapterPager id="video" />
    </div>
  );
}
