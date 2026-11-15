import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { cellColourVar, cellOf, label } from "@/lib/unravel/data";
import { useReducedMotion } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

export function Segmented<T extends string>({ options, value, onChange, label, className, disabled }: { options: { id: T; label: string }[]; value: T | null | undefined; onChange: (v: T) => void; label?: string; className?: string; disabled?: boolean }) {
  const uid = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex flex-wrap gap-1 rounded-full border border-border bg-muted/60 p-1", disabled && "opacity-70", className)}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
              on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {on && <motion.span layoutId={`seg-${uid}`} className="absolute inset-0 rounded-full bg-card shadow-card ring-1 ring-border" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* 1 · dementia is a ring of symptoms holding several diseases */
export function GfxSymptoms({ g }: { g: any }) {
  const [hi, setHi] = useState<number | null>(0);
  const discs: { name: string; line: string }[] = g.discs;
  const pos = [
    { cx: 168, cy: 178, r: 84 },
    { cx: 300, cy: 128, r: 40 },
    { cx: 306, cy: 222, r: 36 },
    { cx: 214, cy: 66, r: 30 },
  ];
  const fills = ["var(--coral)", "var(--peri)", "var(--cell-sst)", "var(--cell-l5-it)"];
  return (
    <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
      <svg viewBox="0 0 420 340" className="w-full" role="img" aria-label={g.ringLabel}>
        <circle cx={220} cy={170} r={158} fill="var(--surface)" stroke="var(--foreground)" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="3 7" strokeLinecap="round" />
        <text x={220} y={332} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={11} letterSpacing={1.4} fill="var(--muted-foreground)">{String(g.ringLabel).toUpperCase()}</text>
        {pos.map((p, i) => (
          <motion.g key={i} onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} tabIndex={0} style={{ cursor: "pointer", outline: "none" }} initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 200, damping: 18 }}>
            <circle cx={p.cx} cy={p.cy} r={p.r} style={{ fill: fills[i] }} fillOpacity={hi === i ? 0.95 : 0.32} stroke={fills[i]} strokeWidth={2} className="transition-[fill-opacity] duration-300" />
            {i === 0 && (
              <text x={p.cx} y={p.cy + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={hi === 0 ? "var(--card)" : "var(--foreground)"}>
                {discs[0]?.name.split(" ")[0]}
              </text>
            )}
          </motion.g>
        ))}
      </svg>
      <div className="space-y-2">
        <ul className="space-y-2">
          {discs.map((d, i) => (
            <li key={d.name}>
              <button type="button" onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} onClick={() => setHi(i)} className={cn("flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all", hi === i ? "border-border bg-card shadow-card" : "border-transparent hover:bg-card/60")}>
                <span className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: fills[i] }} />
                <span>
                  <span className="block font-semibold">{d.name}</span>
                  <span className="block text-sm text-muted-foreground">{d.line}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="kicker pt-2">{g.note}</p>
      </div>
    </div>
  );
}

/* 2 · as the pathology level rises, links fade, neurons dim and immune cells gather */
const NEURONS = [[60, 70], [150, 40], [250, 80], [340, 50], [90, 170], [200, 150], [310, 170], [140, 250], [260, 250], [370, 240]] as const;
const LINKS = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [3, 6], [4, 5], [5, 6], [4, 7], [5, 7], [5, 8], [6, 8], [6, 9], [7, 8], [8, 9], [2, 6], [1, 4]] as const;
export function GfxCellsDisease({ g }: { g: any }) {
  const levels: string[] = g.levels;
  const [lv, setLv] = useState(levels[0]!);
  const k = levels.indexOf(lv);
  const t = k / Math.max(1, levels.length - 1);
  const reduced = useReducedMotion();
  const tr = { duration: reduced ? 0 : 0.6 };
  return (
    <div className="space-y-5">
      <Segmented label="levels" options={levels.map((l) => ({ id: l, label: l }))} value={lv} onChange={setLv} />
      <svg viewBox="0 0 430 300" className="w-full rounded-2xl border border-border bg-surface" role="img" aria-label={lv}>
        {LINKS.map(([a, b], i) => {
          const gone = (i * 0.37) % 1 < t * 0.75;
          return (
            <motion.line key={i} x1={NEURONS[a][0]} y1={NEURONS[a][1]} x2={NEURONS[b][0]} y2={NEURONS[b][1]} stroke="var(--peri)" strokeWidth={2.5} strokeLinecap="round" initial={false} animate={{ opacity: gone ? 0.06 : 0.55 - t * 0.2 }} transition={tr} />
          );
        })}
        {NEURONS.map(([x, y], i) => {
          const dim = (i * 0.53) % 1 < t * 0.6;
          return <motion.circle key={i} cx={x} cy={y} r={11} fill="var(--peri)" initial={false} animate={{ opacity: dim ? 0.2 : 1, scale: dim ? 0.8 : 1 }} transition={tr} style={{ transformOrigin: `${x}px ${y}px` }} />;
        })}
        {[[110, 110], [230, 205], [300, 110], [60, 230], [380, 140], [190, 90]].map(([x, y], i) => (
          <motion.g key={i} initial={false} animate={{ opacity: i < Math.round(t * 6) ? 1 : 0, scale: i < Math.round(t * 6) ? 1 : 0.4 }} transition={tr} style={{ transformOrigin: `${x}px ${y}px` }}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <line key={a} x1={x} y1={y} x2={x! + Math.cos((a * Math.PI) / 180) * 13} y2={y! + Math.sin((a * Math.PI) / 180) * 13} stroke="var(--coral)" strokeWidth={2} strokeLinecap="round" />
            ))}
            <circle cx={x} cy={y} r={5.5} fill="var(--coral)" />
          </motion.g>
        ))}
      </svg>
      <p className="kicker">{g.note}</p>
    </div>
  );
}

export function SceneSvg({ scene }: { scene: string }) {
  return (
    <svg viewBox="0 0 220 120" className="w-full rounded-xl border border-border bg-card" aria-hidden>
      {[[50, 60], [170, 60]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={22} fill="var(--peri-soft)" stroke="var(--peri)" strokeWidth={2} />
          <path d={`M${x! + (i ? -22 : 22)} ${y} L ${i ? 120 : 100} ${y}`} stroke="var(--peri)" strokeWidth={2} />
          {scene === "tangle" && <path d={`M${x! - 10} ${y! - 6} q 5 -8 10 0 t 10 0 M${x! - 10} ${y! + 4} q 5 8 10 0 t 10 0`} fill="none" stroke="var(--coral)" strokeWidth={2.5} strokeLinecap="round" />}
        </g>
      ))}
      {scene === "plaque" &&
        [[104, 44], [116, 70], [100, 82], [124, 50], [110, 58]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4 + (i % 3)} fill="var(--coral)" fillOpacity={0.85} />)}
    </svg>
  );
}

/* 3 · four kinds of brain cell */
function CellGlyph({ id }: { id: string }) {
  const c = cellColourVar(id);
  return (
    <svg viewBox="0 0 80 60" className="h-14 w-20" aria-hidden>
      {id === "l2-3-it" && (
        <>
          <path d="M20 40 L30 20 L40 40 Z" fill={c} />
          <path d="M40 34 C 52 30, 62 40, 78 32" fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
          <path d="M30 20 L30 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
        </>
      )}
      {id === "sst" && (
        <>
          <circle cx={36} cy={30} r={10} fill={c} />
          {[0, 90, 180, 270].map((a) => (
            <line key={a} x1={36 + Math.cos((a * Math.PI) / 180) * 10} y1={30 + Math.sin((a * Math.PI) / 180) * 10} x2={36 + Math.cos((a * Math.PI) / 180) * 19} y2={30 + Math.sin((a * Math.PI) / 180) * 19} stroke={c} strokeWidth={4} strokeLinecap="round" />
          ))}
        </>
      )}
      {id === "microglia-pvm" && (
        <>
          <circle cx={40} cy={30} r={6} fill={c} />
          {[20, 80, 150, 210, 280, 330].map((a) => {
            const r1 = (a * Math.PI) / 180;
            const x = 40 + Math.cos(r1) * 20, y = 30 + Math.sin(r1) * 20;
            return <path key={a} d={`M40 30 L${x} ${y} l ${Math.cos(r1 + 0.6) * 6} ${Math.sin(r1 + 0.6) * 6} M${x} ${y} l ${Math.cos(r1 - 0.6) * 6} ${Math.sin(r1 - 0.6) * 6}`} stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" />;
          })}
        </>
      )}
      {id === "astrocyte" && (
        <>
          <path d="M6 30 H74" stroke="var(--foreground)" strokeOpacity={0.25} strokeWidth={3} />
          {[16, 30, 44, 58].map((x) => <rect key={x} x={x} y={24} width={10} height={12} rx={4} fill={c} fillOpacity={0.75} />)}
        </>
      )}
    </svg>
  );
}
export function GfxCellGroups({ g }: { g: any }) {
  const groups: { plain: string; sci: string; job: string; cellType: string }[] = g.groups;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {groups.map((x, i) => (
        <motion.li key={x.plain} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card">
          <span className="absolute inset-x-0 top-0 h-1" style={{ background: cellColourVar(x.cellType) }} />
          <div className="flex items-start gap-3">
            <CellGlyph id={x.cellType} />
            <div className="min-w-0">
              <p className="font-semibold">{x.plain}</p>
              <p className="font-mono text-xs tracking-wide text-muted-foreground">{x.sci}</p>
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{x.job}</p>
        </motion.li>
      ))}
    </ul>
  );
}

/* 4 · ground-up tissue gives one average; one cell at a time shows each type */
export function GfxOneAtATime({ g }: { g: any }) {
  const reduced = useReducedMotion();
  const types = ["l2-3-it", "sst", "microglia-pvm", "astrocyte", "l2-3-it", "astrocyte", "sst", "l2-3-it", "microglia-pvm", "astrocyte"];
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setN((k) => k + 1), 1500);
    return () => clearInterval(t);
  }, [reduced]);
  const SLOT = 60, CX = 210, VIS = 9;
  // cell k sits at x = CX + (k - n) * SLOT; cells with k <= n have been read
  const ks = Array.from({ length: VIS + 2 }, (_, j) => n - 5 + j);
  const cur = types[((n % types.length) + types.length) % types.length]!;
  const curCell = cellOf(cur);
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 420 200" className="w-full rounded-2xl border border-border bg-surface" role="img" aria-label={g.labels[1]}>
        <defs>
          <clipPath id="belt-clip"><rect x="0" y="0" width="420" height="200" /></clipPath>
        </defs>
        {/* scanner */}
        <path d={`M${CX - 34} 18 h68 l-10 22 h-48 z`} fill="var(--foreground)" opacity="0.85" />
        <motion.path d={`M${CX - 24} 40 L${CX - 34} 112 L${CX + 34} 112 L${CX + 24} 40 Z`} fill="var(--go)" initial={false} animate={{ opacity: [0.08, 0.2, 0.08] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <circle cx={CX} cy={29} r={4} fill="var(--go)" />
        {/* belt */}
        <rect x="6" y="128" width="408" height="16" rx="8" fill="var(--muted)" stroke="var(--border)" />
        {Array.from({ length: 14 }, (_, j) => (
          <line key={j} x1={22 + j * 29} x2={22 + j * 29} y1={131} y2={141} stroke="var(--border)" strokeWidth={2} />
        ))}
        <circle cx="14" cy="136" r="10" fill="var(--card)" stroke="var(--border)" />
        <circle cx="406" cy="136" r="10" fill="var(--card)" stroke="var(--border)" />
        <g clipPath="url(#belt-clip)">
          {ks.map((k) => {
            const t = types[((k % types.length) + types.length) % types.length]!;
            const read = k <= n;
            const x = CX + (k - n) * SLOT;
            return (
              <motion.g key={k} initial={{ x: x + SLOT, opacity: 0 }} animate={{ x, opacity: 1 }} transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}>
                <motion.circle cy={108} r={k === n ? 17 : 14} initial={false} animate={{ fill: read ? cellColourVar(t) : "var(--muted-foreground)", fillOpacity: read ? 0.9 : 0.3 }} transition={{ duration: 0.4 }} stroke="var(--card)" strokeWidth={2} />
                <circle cy={108} r={4} fill="var(--card)" opacity={0.7} />
              </motion.g>
            );
          })}
        </g>
        {/* readout */}
        <rect x={CX - 90} y={156} width={180} height={30} rx={8} fill="var(--card)" stroke="var(--border)" />
        <circle cx={CX - 74} cy={171} r={6} fill={cellColourVar(cur)} />
        <AnimatePresence mode="wait">
          <motion.text key={n} x={CX - 62} y={175} fontSize="12" fill="var(--foreground)" fontWeight={600} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {curCell ? label(curCell) : cur}
          </motion.text>
        </AnimatePresence>
      </svg>
      <p className="kicker">{g.labels[1]}</p>
    </div>
  );
}
