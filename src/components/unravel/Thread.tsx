import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

/* Every path shares one command structure so framer can morph between them.
   The knot loosens: the loop swells and the ends draw outward, the crossing slips,
   the loop relaxes into a wave, and only then does the thread pull taut. */
const KNOT = "M4 60 C 150 60, 220 60, 262 44 C 318 22, 340 96, 296 92 C 252 88, 286 18, 336 40 C 372 56, 450 60, 596 60";
const LOOSEN = "M4 60 C 140 60, 205 60, 244 42 C 316 6, 372 104, 300 100 C 228 96, 300 6, 362 40 C 404 62, 460 60, 596 60";
const SLIP = "M4 60 C 120 60, 180 60, 222 52 C 290 28, 334 90, 300 78 C 266 66, 330 30, 382 52 C 424 66, 480 60, 596 60";
const WAVE = "M4 60 C 120 60, 186 60, 232 58 C 280 52, 298 70, 300 64 C 302 58, 322 52, 370 60 C 420 64, 480 60, 596 60";
const STRAIGHT = "M4 60 C 150 60, 220 60, 262 60 C 290 60, 296 60, 300 60 C 304 60, 316 60, 336 60 C 372 60, 450 60, 596 60";

/** The coral thread. `untie` plays the full unravelling; without it the knot just draws in and stays tied. */
export function Thread({ className, delay = 0.2, small = false, untie = false }: { className?: string; delay?: number; small?: boolean; untie?: boolean }) {
  const reduced = useReducedMotion();
  const draw = reduced ? 0 : small ? 0.9 : 1.4;
  return (
    <svg viewBox="0 0 600 110" className={cn("h-auto w-full overflow-visible", className)} aria-hidden>
      <motion.path
        fill="none"
        stroke="var(--coral)"
        strokeWidth={small ? 2.5 : 5}
        vectorEffect={small ? "non-scaling-stroke" : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, d: KNOT }}
        animate={untie && !reduced ? { pathLength: 1, d: [KNOT, KNOT, LOOSEN, SLIP, WAVE, STRAIGHT] } : { pathLength: 1, d: untie ? STRAIGHT : KNOT }}
        transition={{
          pathLength: { duration: draw, ease: [0.65, 0, 0.35, 1], delay },
          d: { duration: reduced ? 0 : 3.4, times: [0, 0.34, 0.52, 0.68, 0.84, 1], ease: "easeInOut", delay },
        }}
      />
      {untie && <motion.circle cx={596} cy={60} r={6} fill="var(--coral)" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: reduced ? 0 : delay + 3.3 }} />}
    </svg>
  );
}
