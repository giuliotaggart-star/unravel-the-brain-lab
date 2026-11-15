import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Same command structure in both paths so the knot can morph straight.
const KNOT = "M4 60 C 150 60, 220 60, 262 44 C 318 22, 340 96, 296 92 C 252 88, 286 18, 336 40 C 372 56, 450 60, 596 60";
const STRAIGHT = "M4 60 C 150 60, 220 60, 262 60 C 318 60, 340 60, 296 60 C 252 60, 286 60, 336 60 C 372 60, 450 60, 596 60";

/** A coral thread that draws in with a knot, then pulls itself straight. */
export function Thread({ className, delay = 0.2, small = false }: { className?: string; delay?: number; small?: boolean }) {
  return (
    <svg viewBox="0 0 600 110" preserveAspectRatio={small ? "none" : undefined} className={cn("h-auto w-full", className)} aria-hidden>
      <motion.path
        fill="none"
        stroke="var(--coral)"
        strokeWidth={small ? 3 : 5}
        vectorEffect={small ? "non-scaling-stroke" : undefined}
        strokeLinecap="round"
        initial={{ pathLength: 0, d: KNOT }}
        animate={{ pathLength: 1, d: [KNOT, KNOT, STRAIGHT] }}
        transition={{
          pathLength: { duration: small ? 0.9 : 1.4, ease: [0.65, 0, 0.35, 1], delay },
          d: { duration: small ? 2.2 : 3.2, times: [0, 0.55, 1], ease: [0.65, 0, 0.35, 1], delay },
        }}
      />
      {!small && <motion.circle cx={596} cy={60} r={6} fill="var(--coral)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 1.4 }} />}
    </svg>
  );
}
