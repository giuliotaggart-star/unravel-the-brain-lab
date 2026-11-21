import { motion } from "framer-motion";
import { cellColourVar, LUI } from "@/lib/unravel/data";
import type { LabStats } from "@/lib/unravel/stats";
import { useReducedMotion } from "@/lib/unravel/store";
import type { CaseStudy } from "@/lib/unravel/types";

const tri = (x: number, y: number, s = 11) => `M${x} ${y - s} L${x + s * 0.9} ${y + s * 0.7} L${x - s * 0.9} ${y + s * 0.7} Z`;

/** Step 1: the cell type in context, drawn once on a quiet grid. */
export function IntroVisual({ cs }: { cs: CaseStudy }) {
  const reduced = useReducedMotion();
  const cell = cs.views[0]!.cellType;
  const col = cellColourVar(cell);
  const draw = (i: number) => ({ initial: { pathLength: reduced ? 1 : 0 }, animate: { pathLength: 1 }, transition: { duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.2 + i * 0.12, ease: [0.65, 0, 0.35, 1] as const } });
  const grey = "color-mix(in oklab, var(--foreground) 22%, transparent)";
  const pyramids: [number, number][] = [[60, 70], [150, 110], [240, 60], [330, 120], [90, 190], [200, 210], [310, 200], [380, 60]];
  return (
    <svg viewBox="0 0 440 280" className="h-full w-full" role="img" aria-label={cs.plainTitle}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={0} y={i * 46 + 4} width={440} height={44} fill="var(--foreground)" fillOpacity={i % 2 ? 0.015 : 0.035} rx={6} />
      ))}
      {cs.id === "sst" && (
        <>
          {pyramids.map(([x, y], i) => <path key={i} d={tri(x, y)} fill={grey} />)}
          {[[110, 140], [270, 150], [190, 100], [360, 220]].map(([x, y], i) => (
            <g key={i}>
              {[[-34, -16], [30, -26], [26, 24], [-28, 26]].map(([dx, dy], j) => (
                <motion.path key={j} d={`M${x} ${y} L${x! + dx! * 0.8} ${y! + dy! * 0.8}`} stroke={col} strokeWidth={5} strokeLinecap="round" fill="none" {...draw(i * 4 + j)} />
              ))}
              <motion.circle cx={x} cy={y} r={11} fill={col} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: reduced ? 0 : 0.1 + i * 0.12 }} style={{ transformOrigin: `${x}px ${y}px` }} />
            </g>
          ))}
        </>
      )}
      {cs.id === "microglia" && (
        <>
          {pyramids.map(([x, y], i) => <path key={i} d={tri(x, y, 9)} fill={grey} />)}
          {[[150, 160], [300, 90]].map(([x, y], i) => (
            <g key={i}>
              {Array.from({ length: 7 }, (_, j) => <circle key={j} cx={x! + Math.cos(j) * 12} cy={y! + Math.sin(j * 1.7) * 10} r={6} fill="var(--foreground)" fillOpacity={0.28} />)}
            </g>
          ))}
          {[[110, 130], [190, 190], [170, 120], [260, 70], [340, 110], [290, 140]].map(([x, y], i) => (
            <g key={i}>
              {[20, 90, 160, 230, 300].map((a, j) => {
                const r = (a * Math.PI) / 180;
                return <motion.path key={j} d={`M${x} ${y} L${x! + Math.cos(r) * 22} ${y! + Math.sin(r) * 22} l ${Math.cos(r + 0.7) * 8} ${Math.sin(r + 0.7) * 8}`} stroke={col} strokeWidth={2.5} strokeLinecap="round" fill="none" {...draw(i * 2 + j * 0.3)} />;
              })}
              <circle cx={x} cy={y} r={6.5} fill={col} />
            </g>
          ))}
        </>
      )}
      {cs.id === "layers" && (
        <>
          {[[80, 200], [200, 230], [330, 210], [140, 170], [380, 250]].map(([x, y], i) => <path key={i} d={tri(x!, y!)} fill={grey} />)}
          {[[60, 80], [150, 70], [250, 90], [350, 75]].map(([x, y], i) => (
            <g key={i}>
              <motion.path d={`M${x} ${y} C ${x! + 60} ${y! - 60}, ${x! + 120} ${y! + 40}, ${x! + 190 > 430 ? 430 : x! + 190} ${y! - 10}`} stroke={col} strokeWidth={2.5} strokeLinecap="round" fill="none" {...draw(i)} />
              <path d={tri(x!, y!, 12)} fill={col} />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

/** Step 3: Donors → Tissue → Nuclei → One value per donor. */
function Arrow({ dir }: { dir: "up" | "down" | "same" | null }) {
  if (!dir) return <span className="block size-7 rounded-md border border-dashed border-border" />;
  const [x1, y1, x2, y2] = dir === "up" ? [6, 21, 22, 7] : dir === "down" ? [6, 7, 22, 21] : [5, 14, 23, 14];
  const a = Math.atan2(y2 - y1, x2 - x1), hd = 7;
  const p = (k: number) => `${(x2 - hd * Math.cos(a + k)).toFixed(1)} ${(y2 - hd * Math.sin(a + k)).toFixed(1)}`;
  return (
    <motion.svg key={dir} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} viewBox="0 0 28 28" width={28} height={28} aria-hidden>
      <path d={`M${x1} ${y1} L${x2} ${y2} M${p(0.55)} L${x2} ${y2} L${p(-0.55)}`} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

/** What you predicted and what was observed: two small glyph boxes above the plot, never arrows over the data. */

/** Methods: how the rank test works, on made-up numbers so the real result stays hidden until Results. */
export function StatsIllustration() {
  const reduced = useReducedMotion();
  const M = LUI().methods;
  const steps: string[] = M.illustrationSteps;
  const groups: string[] = M.illustrationGroups;
  const A = [5, 7, 8, 10, 11, 12], B = [1, 2, 3, 4, 6, 9];
  const x = (v: number) => 110 + (v - 1) * 58;
  const part = (i: number) => ({ initial: { opacity: 0, y: reduced ? 0 : 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: reduced ? 0 : i * 0.8 } });
  const mono = { fontFamily: "var(--font-mono)", letterSpacing: 1 } as const;
  const head = (y: number, t: string | undefined) => <text x={20} y={y} fontSize={15} fontWeight={600} fill="var(--foreground)">{t}</text>;
  const med = (vals: number[]) => { const v = [...vals].sort((p, q) => p - q); return (v[2]! + v[3]!) / 2; };
  const row = (vals: number[], y: number, fill: string, name: string | undefined) => (
    <g>
      <text x={20} y={y + 5} fontSize={12} {...mono} fill="var(--muted-foreground)">{String(name ?? "").toUpperCase()}</text>
      <line x1={x(1) - 20} x2={x(12) + 20} y1={y} y2={y} stroke="var(--border)" strokeWidth={2} />
      {vals.map((v) => <circle key={v} cx={x(v)} cy={y} r={10} fill={fill} />)}
      <line x1={x(med(vals))} x2={x(med(vals))} y1={y - 20} y2={y + 20} stroke="var(--foreground)" strokeWidth={3} />
    </g>
  );
  return (
    <svg viewBox="0 0 830 420" className="h-full w-full" role="img" aria-label={[M.illustration, ...steps].join(". ")}>
      <text x={20} y={22} fontSize={11} {...mono} fill="var(--muted-foreground)">{String(M.illustration ?? "").toUpperCase()}</text>
      <motion.g {...part(0)}>
        {head(60, steps[0])}
        {row(A, 100, "var(--peri)", groups[0])}
        {row(B, 150, "var(--coral)", groups[1])}
      </motion.g>
      <motion.g {...part(1)}>
        {head(215, steps[1])}
        <line x1={x(1) - 20} x2={x(12) + 20} y1={255} y2={255} stroke="var(--border)" strokeWidth={2} />
        {Array.from({ length: 12 }, (_, k) => k + 1).map((r) => (
          <g key={r}>
            <circle cx={x(r)} cy={255} r={10} fill={A.includes(r) ? "var(--peri)" : "var(--coral)"} />
            <text x={x(r)} y={288} textAnchor="middle" fontSize={12} {...mono} fill="var(--muted-foreground)">{r}</text>
          </g>
        ))}
      </motion.g>
      <motion.g {...part(2)}>
        {head(345, steps[2])}
        <path d={`M${x(1) - 12} 365 L${x(1) - 12} 375 L${x(6) + 12} 375 L${x(6) + 12} 365`} fill="none" stroke="var(--coral)" strokeWidth={3} />
        <text x={(x(1) + x(6)) / 2} y={402} textAnchor="middle" fontSize={13} fill="var(--coral-ink)">{M.illustrationNote}</text>
      </motion.g>
    </svg>
  );
}

export function PredictionIndicator({ predicted, observed }: { predicted: "up" | "down" | "same" | null; observed: "up" | "down" | "same" | null }) {
  const ui = LUI();
  const match = predicted && observed && predicted === observed;
  const box = (label: string, dir: typeof predicted, tone: string) => (
    <div className={`flex items-center gap-3 rounded-xl border bg-card px-3 py-2 ${dir ? tone : "border-border text-muted-foreground"}`} aria-label={dir ? `${label}: ${ui.hypothesis[dir]}` : label}>
      <span className="kicker">{label}</span>
      <Arrow dir={dir} />
    </div>
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      {box(ui.arrows.predicted, predicted, "border-peri/40 text-peri-ink")}
      {box(ui.arrows.observed, observed, match ? "border-good/40 text-good" : "border-coral/40 text-coral-ink")}
    </div>
  );
}
