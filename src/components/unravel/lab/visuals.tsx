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
export function MethodsPipeline({ S, cs }: { S: LabStats; cs: CaseStudy }) {
  const reduced = useReducedMotion();
  const labels: string[] = LUI().methods.pipeline;
  const col = cellColourVar(cs.views[0]!.cellType);
  const part = (i: number) => ({ initial: { opacity: 0, y: reduced ? 0 : 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: reduced ? 0 : i * 0.7 } });
  const nuc = Array.from({ length: 56 }, (_, i) => ({ x: 486 + (i % 7) * 20, y: 120 + Math.floor(i / 7) * 20, hit: (i * 7 + 3) % 5 === 0 }));
  const label = (x: number, t: string | undefined) => (
    <text x={x} y={396} textAnchor="middle" fontSize={13} letterSpacing={1.3} fontFamily="var(--font-mono)" fill="var(--foreground)">
      {String(t ?? "").toUpperCase()}
    </text>
  );
  const chev = (x: number) => <path d={`M${x - 7} 200 L${x + 7} 214 L${x - 7} 228`} fill="none" stroke="var(--muted-foreground)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />;
  let y = 40;
  return (
    <svg viewBox="0 0 830 420" className="h-full w-full" role="img" aria-label={labels.join(", ")}>
      <motion.g {...part(0)}>
        {S.Q.groups.map((g) => {
          const y0 = y;
          y += Math.ceil(g.n / 12) * 15 + 28;
          return (
            <g key={g.name}>
              <text x={14} y={y0} fontSize={11} letterSpacing={1} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">{`${g.name} · ${g.n}`.toUpperCase()}</text>
              {Array.from({ length: g.n }, (_, k) => (
                <circle key={k} cx={20 + (k % 12) * 16} cy={y0 + 12 + Math.floor(k / 12) * 15} r={5} fill="var(--peri)" fillOpacity={0.75} />
              ))}
            </g>
          );
        })}
        {label(112, labels[0])}
      </motion.g>
      <motion.g {...part(1)}>
        {chev(228)}
        <rect x={276} y={168} width={110} height={88} rx={12} fill="var(--peri-soft)" stroke="var(--peri)" strokeWidth={2.5} />
        {label(331, labels[1])}
      </motion.g>
      <motion.g {...part(2)}>
        {chev(432)}
        {nuc.map((n, i) => (
          <motion.circle key={i} r={n.hit ? 7 : 5.5} style={{ fill: n.hit ? col : "var(--muted-foreground)" }} fillOpacity={n.hit ? 1 : 0.35} initial={{ cx: 331, cy: 212, opacity: 0 }} animate={{ cx: n.x, cy: n.y, opacity: 1 }} transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 1.4 + i * 0.01 }} />
        ))}
        {label(546, labels[2])}
      </motion.g>
      <motion.g {...part(3)}>
        {chev(660)}
        <line x1={690} y1={90} x2={690} y2={330} stroke="var(--foreground)" strokeOpacity={0.4} strokeWidth={2} />
        <line x1={690} y1={330} x2={820} y2={330} stroke="var(--foreground)" strokeOpacity={0.4} strokeWidth={2} />
        <motion.circle r={10} style={{ fill: col }} initial={{ cx: 600, cy: 212, opacity: 0 }} animate={{ cx: 760, cy: 230, opacity: 1 }} transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 2.6, ease: [0.65, 0, 0.35, 1] }} />
        {label(755, labels[3])}
      </motion.g>
    </svg>
  );
}

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
