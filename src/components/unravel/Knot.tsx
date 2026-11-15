import { AnimatePresence, motion } from "framer-motion";
import { useId, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

/* "Unravel this": an overhand knot in a short length of thread. Pressing it pulls the thread straight
   and the explanation opens inline underneath — it never covers the text around it. */
const TIED =
  "M2 26 C 30 26, 52 26, 62 18 C 74 6, 98 6, 98 22 C 98 38, 70 40, 66 26 C 62 12, 92 10, 104 24 C 112 32, 128 26, 158 26";
const LOOSE =
  "M2 26 C 30 26, 52 26, 62 26 C 74 26, 86 26, 94 26 C 102 26, 106 26, 112 26 C 120 26, 126 26, 132 26 C 140 26, 150 26, 158 26";

export function Knot({ label, title, children, className }: { label: string; title?: ReactNode; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const id = useId();
  const t = { duration: reduced ? 0 : 0.75, ease: [0.65, 0, 0.35, 1] as const };
  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group inline-flex items-center gap-3 rounded-full border bg-card py-1.5 pl-2 pr-5 text-sm font-semibold shadow-card transition-all",
          open ? "border-coral/50 text-coral-ink" : "border-border text-foreground hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-lift",
        )}
      >
        <svg viewBox="0 0 160 52" width="92" height="30" aria-hidden className="overflow-visible">
          <motion.path
            d={TIED}
            initial={false}
            animate={{ d: open ? LOOSE : TIED }}
            transition={t}
            fill="none"
            stroke="var(--coral)"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.circle initial={false} animate={{ cx: open ? 158 : 158, opacity: open ? 1 : 0 }} transition={t} cy={26} r={4} fill="var(--coral)" />
        </svg>
        <span>{label}</span>
        <motion.span initial={false} animate={{ rotate: open ? 45 : 0 }} transition={t} className="ml-0.5 text-base leading-none text-muted-foreground" aria-hidden>
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="callout"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : open ? 0.25 : 0 }}
            className="overflow-hidden"
          >
            <div className="relative mt-4 rounded-2xl border border-coral/25 bg-coral-soft/60 p-5 pl-6 sm:p-6 sm:pl-7">
              <span className="absolute bottom-5 left-0 top-5 w-[3px] rounded-full bg-coral" aria-hidden />
              {title && <p className="font-display-tight mb-2 text-xl font-medium text-foreground">{title}</p>}
              <div className="space-y-3 leading-relaxed text-foreground/90">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
