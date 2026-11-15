import { motion } from "framer-motion";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { data, fill, isText, label, num, qty, tech } from "@/lib/unravel/data";
import { axisTitle, niceAxis, yTitle, type Question } from "@/lib/unravel/stats";
import type { Donor } from "@/lib/unravel/types";
import { useReducedMotion } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

export interface DonorPlotProps {
  Q: Question;
  /** "groups" shades groups periwinkle → coral; any other value is one CSS colour for every dot */
  colour?: "groups" | string;
  tint?: Map<string, string> | null;
  revealed?: boolean;
  showMedian?: boolean;
  showIQR?: boolean;
  className?: string;
  /** delay before the first group drops in, in seconds */
  delay?: number;
}
export interface DonorPlotHandle { svg: SVGSVGElement | null }

const groupColour = (gi: number, n: number) => {
  const t = n > 1 ? gi / (n - 1) : 0;
  return `color-mix(in oklab, var(--peri) ${Math.round((1 - t) * 100)}%, var(--coral))`;
};

/** Donor fields for the tooltip card, labelled the way the data labels them. */
function donorFields(d: Donor) {
  const conf = (id: string) => data.confounders.find((c) => c.id === id);
  const grp = (id: string) => data.groupings.find((g) => g.id === id);
  return [
    { k: label(conf("age")), v: d.age },
    { k: label(conf("sex")), v: d.sex },
    { k: label(conf("apoe4")), v: d.apoe4 },
    { k: label(grp("adnc")), v: d.adnc },
    { k: label(grp("braak")), v: d.braakBand },
    { k: label(grp("cognitive")), v: d.cognitive },
  ];
}

export const DonorPlot = forwardRef<DonorPlotHandle, DonorPlotProps>(function DonorPlot(
  { Q, colour = "groups", tint = null, revealed = true, showMedian = true, showIQR = true, className, delay = 0 },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  useImperativeHandle(ref, () => ({ svg: svgRef.current }), []);
  const reduced = useReducedMotion();
  const [W, setW] = useState(640);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = Math.round(el.clientWidth);
      if (w > 0) setW((prev) => (Math.abs(prev - w) > 4 ? w : prev));
    });
    ro.observe(el);
    setW(Math.round(el.clientWidth) || 640);
    return () => ro.disconnect();
  }, []);

  const narrow = W < 520;
  const ends = Q.grouping.ends ?? [];
  const notes = Q.grouping.bandNotes ?? {};
  const hasNotes = !narrow && Q.groups.some((g) => isText(notes[g.name]));
  const M = { l: narrow ? 44 : 58, r: 14, t: tech(Q.metric) ? 58 : 40, b: (ends.length === 2 ? 72 : 62) + (hasNotes ? 20 : 0) };
  const H = (narrow ? 300 : 380) + M.b - 60;
  const axis = niceAxis(Q.max * 1.05);
  const Y = (v: number) => M.t + (1 - v / axis.max) * (H - M.t - M.b);
  const band = (W - M.l - M.r) / Math.max(1, Q.groups.length);
  const r = narrow ? 4 : 5.2;

  const dots = useMemo(() => {
    const out: { id: string; donor: Donor; value: number; gi: number; i: number; x: number; y: number }[] = [];
    Q.groups.forEach((g, gi) => {
      const cx = M.l + gi * band + band / 2;
      const half = Math.min(band * 0.3, 46);
      g.rows.forEach((row, i) => {
        const jitter = ((i * 0.61803398875) % 1) * 2 - 1;
        out.push({ id: row.donor.id, donor: row.donor, value: row.value, gi, i, x: cx + jitter * half, y: Y(row.value) });
      });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Q, W, H]);
  const ordered = useMemo(() => [...dots].sort((a, b) => a.gi - b.gi || a.value - b.value), [dots]);

  const active = pinned ?? hover;
  const activeDot = dots.find((d) => d.id === active) ?? null;

  const nearest = (ev: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = W / rect.width;
    const x = (ev.clientX - rect.left) * sx, y = (ev.clientY - rect.top) * sx;
    let best: (typeof dots)[number] | null = null, bd = 22 * 22;
    for (const d of dots) {
      const k = (d.x - x) ** 2 + (d.y - y) ** 2;
      if (k <= bd) { bd = k; best = d; }
    }
    return best;
  };
  const onKey = (ev: KeyboardEvent<SVGSVGElement>) => {
    if (!ordered.length) return;
    const i = Math.max(0, ordered.findIndex((d) => d.id === active));
    const go = (j: number) => { ev.preventDefault(); setPinned(ordered[(j + ordered.length) % ordered.length]!.id); };
    if (ev.key === "ArrowRight" || ev.key === "ArrowUp") go(active ? i + 1 : 0);
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") go(active ? i - 1 : 0);
    else if (ev.key === "Escape") { setPinned(null); setHover(null); }
  };

  const fillOf = (d: (typeof dots)[number]) => tint?.get(d.id) ?? (colour === "groups" ? groupColour(d.gi, Q.groups.length) : colour);
  const tipTitle = activeDot ? fill(data.lab.donorTitle, { donorId: activeDot.id, value: qty(activeDot.value, Q.unit, Q.dec + 1), age: activeDot.donor.age, sex: activeDot.donor.sex }) : "";
  const baseY = Y(0);

  return (
    <div ref={box} className={cn("relative w-full select-none", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="group"
        tabIndex={0}
        aria-label={[yTitle(Q), label(Q.cell), label(Q.grouping)].filter(Boolean).join(", ")}
        className="block overflow-visible rounded-xl font-sans outline-none focus-visible:ring-2 focus-visible:ring-peri/50"
        onPointerMove={(ev) => { const d = nearest(ev); setHover(d ? d.id : null); }}
        onPointerLeave={() => setHover(null)}
        onClick={(ev) => { const d = nearest(ev as unknown as PointerEvent<SVGSVGElement>); setPinned(d && d.id !== pinned ? d.id : null); }}
        onKeyDown={onKey}
        onBlur={() => setPinned(null)}
        style={{ cursor: hover ? "pointer" : "default" }}
      >
        {/* y title */}
        <text x={0} y={16} fontSize={14} fontWeight={600} fill="var(--foreground)">{yTitle(Q)}</text>
        {tech(Q.metric) && <text x={0} y={34} fontSize={11} letterSpacing={1.2} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">{tech(Q.metric).toUpperCase()}</text>}
        {/* grid + axis */}
        <line x1={M.l} x2={W - M.r} y1={baseY} y2={baseY} stroke="var(--foreground)" strokeOpacity={0.35} strokeWidth={1.25} />
        <text x={M.l - 8} y={baseY + 4} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">0</text>
        {axis.ticks.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={Y(t)} y2={Y(t)} stroke="var(--foreground)" strokeOpacity={0.07} strokeDasharray="2 4" />
            <text x={M.l - 8} y={Y(t) + 4} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">{num(t, 2)}</text>
          </g>
        ))}
        {/* bands */}
        {Q.groups.map((g, gi) => {
          const x0 = M.l + gi * band;
          const cx = x0 + band / 2;
          const half = Math.min(band * 0.3, 46);
          const sub = hasNotes && isText(notes[g.name]) && notes[g.name]!.length * 6.4 <= band ? notes[g.name] : "";
          return (
            <g key={g.name}>
              {gi % 2 === 1 && <rect x={x0} y={M.t - 6} width={band} height={baseY - M.t + 6} fill="var(--foreground)" fillOpacity={0.018} />}
              {showIQR && g.n > 0 && (
                <motion.rect
                  x={cx - half - 8}
                  width={2 * half + 16}
                  rx={6}
                  initial={false}
                  animate={{ y: Y(g.q3), height: Math.max(2, Y(g.q1) - Y(g.q3)), opacity: revealed ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : delay + gi * 0.18 + 0.35 }}
                  fill={colour === "groups" ? groupColour(gi, Q.groups.length) : colour}
                  fillOpacity={0.1}
                  stroke={colour === "groups" ? groupColour(gi, Q.groups.length) : colour}
                  strokeOpacity={0.28}
                />
              )}
              <text x={cx} y={baseY + 20} textAnchor="middle" fontSize={narrow ? 11 : 12.5} fontWeight={600} fill="var(--foreground)">{g.name}</text>
              {sub && <text x={cx} y={baseY + 37} textAnchor="middle" fontSize={11.5} fill="var(--muted-foreground)">{sub}</text>}
              {band >= 48 && (
                <text x={cx} y={baseY + (sub || hasNotes ? 55 : 37)} textAnchor="middle" fontSize={10.5} letterSpacing={0.8} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                  {fill(data.lab.nLabel, { n: g.n }).toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
        {/* dots */}
        <g>
          {dots.map((d) => (
            <motion.circle
              key={d.id}
              r={d.id === active ? r + 2 : r}
              initial={{ cx: d.x, cy: M.t - 10, opacity: 0 }}
              animate={{ cx: d.x, cy: revealed ? d.y : M.t - 10, opacity: revealed ? 1 : 0 }}
              transition={{
                duration: reduced ? 0 : 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: reduced ? 0 : delay + d.gi * 0.18 + (d.i % 24) * 0.012,
              }}
              style={{ fill: fillOf(d), transition: "fill 300ms ease" }}
              fillOpacity={active && d.id !== active ? 0.55 : 0.88}
              stroke="var(--card)"
              strokeWidth={1.2}
            />
          ))}
        </g>
        {/* medians */}
        {showMedian &&
          Q.groups.map((g, gi) => {
            if (!g.n) return null;
            const cx = M.l + gi * band + band / 2;
            const half = Math.min(band * 0.3, 46) + 12;
            return (
              <motion.line
                key={g.name}
                x1={cx - half}
                x2={cx + half}
                initial={false}
                animate={{ y1: Y(g.median), y2: Y(g.median), opacity: revealed ? 1 : 0, pathLength: revealed ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : delay + Q.groups.length * 0.18 + 0.55 + gi * 0.1 }}
                stroke="var(--foreground)"
                strokeWidth={3.2}
                strokeLinecap="round"
              />
            );
          })}
        {activeDot && <circle cx={activeDot.x} cy={activeDot.y} r={r + 6} fill="none" stroke="var(--foreground)" strokeWidth={1.5} pointerEvents="none" />}
        {/* x axis title */}
        {ends.length === 2 ? (
          <>
            <text x={M.l} y={H - 22} fontSize={12.5} fontWeight={600} fill="var(--foreground)">← {ends[0]}</text>
            <text x={W - M.r} y={H - 22} fontSize={12.5} fontWeight={600} textAnchor="end" fill="var(--foreground)">{ends[1]} →</text>
            <text x={M.l + (W - M.l - M.r) / 2} y={H - 4} textAnchor="middle" fontSize={10.5} letterSpacing={1} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              {[axisTitle(Q), tech(Q.grouping)].filter(Boolean).join(" · ").toUpperCase()}
            </text>
          </>
        ) : (
          <>
            <text x={M.l + (W - M.l - M.r) / 2} y={H - 20} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="var(--foreground)">{axisTitle(Q)}</text>
            {tech(Q.grouping) && (
              <text x={M.l + (W - M.l - M.r) / 2} y={H - 4} textAnchor="middle" fontSize={10.5} letterSpacing={1} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">{tech(Q.grouping).toUpperCase()}</text>
            )}
          </>
        )}
      </svg>
      {/* tooltip */}
      {activeDot && revealed && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute z-10 w-60 rounded-xl border border-border bg-popover p-3 text-xs shadow-lift"
          style={{
            left: `${Math.min(Math.max((activeDot.x / W) * 100, 0), 100)}%`,
            top: activeDot.y,
            transform: `translate(${activeDot.x > W * 0.62 ? "calc(-100% - 14px)" : "14px"}, -50%)`,
          }}
        >
          <p className="mb-2 text-[0.8rem] font-semibold leading-snug text-foreground">{tipTitle}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {donorFields(activeDot.donor).map((f) => (
              <div key={f.k} className="contents">
                <dt className="text-muted-foreground">{f.k}</dt>
                <dd className="text-right font-medium text-foreground">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
});

/** The numbers behind the chart, for the "Show as table" toggle and the curious drawer. */
export function StatsTable({ Q }: { Q: Question }) {
  const cols = data.lab.tableColumns || {};
  const unit = Q.unit;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">{[cols.group, label(Q.grouping)].filter(isText).join(": ")}</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">{cols.n}</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">{`${cols.median} (${unit})`}</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">{`${cols.iqr} (${unit})`}</th>
          </tr>
        </thead>
        <tbody>
          {Q.groups.map((g) => (
            <tr key={g.name} className="border-t border-border">
              <th scope="row" className="px-3 py-2 text-left font-medium">{g.name}</th>
              <td className="px-3 py-2 text-right tabular-nums">{g.n}</td>
              <td className="px-3 py-2 text-right tabular-nums">{g.n ? num(g.median, Q.dec + 1) : "–"}</td>
              <td className="px-3 py-2 text-right tabular-nums">{g.n ? `${num(g.q1, Q.dec + 1)} – ${num(g.q3, Q.dec + 1)}` : "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
