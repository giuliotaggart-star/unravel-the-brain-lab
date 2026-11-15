/* Donor-level statistics, ported unchanged from the original app (assets/app.js). */
import { cellOf, data, fill, groupingOf, isNum, isText, label, lowerFirst, metricOf, num, qty, seriesOf, donorUnit, type Vars } from "./data";
import type { CaseStudy, CellType, Confounder, Donor, Grouping, Metric } from "./types";

export interface Row { donor: Donor; value: number }
export interface Summary { n: number; median: number; q1: number; q3: number; mean: number; sd: number }
export interface Group extends Summary { name: string; rows: Row[] }
export interface Question {
  q: { metric: string; cellType: string; grouping: string };
  metric: Metric;
  cell: CellType | null;
  grouping: Grouping;
  groups: Group[];
  first: Group | null;
  last: Group | null;
  trend: "up" | "down" | "same";
  dec: number;
  unit: string;
  d: number;
  fold: number;
  mw: { u: number; p: number; n1: number; n2: number } | null;
  max: number;
}

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (pos - lo);
}
export function summary(values: number[]): Summary {
  const v = values.filter(isNum).sort((a, b) => a - b);
  const mean = v.length ? v.reduce((a, x) => a + x, 0) / v.length : NaN;
  const sd = v.length > 1 ? Math.sqrt(v.reduce((a, x) => a + (x - mean) ** 2, 0) / (v.length - 1)) : NaN;
  return { n: v.length, median: quantile(v, 0.5), q1: quantile(v, 0.25), q3: quantile(v, 0.75), mean, sd };
}
export function cohensD(a: Summary | null, b: Summary | null): number {
  if (!a || !b || a === b || a.n < 2 || b.n < 2) return NaN;
  const pooled = Math.sqrt(((a.n - 1) * a.sd ** 2 + (b.n - 1) * b.sd ** 2) / (a.n + b.n - 2));
  return pooled > 0 ? (b.mean - a.mean) / pooled : NaN;
}
const foldChange = (a: Summary | null, b: Summary | null) => (a && b && a !== b && a.median > 0 && isNum(b.median) ? b.median / a.median : NaN);
function normCdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const p = 0.3989422804 * Math.exp((-z * z) / 2) * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}
/** Mann–Whitney U, normal approximation with tie and continuity correction. */
export function mannWhitney(xs: number[], ys: number[]) {
  const n1 = xs.length, n2 = ys.length;
  if (n1 < 1 || n2 < 1) return null;
  const all = xs.map((v) => ({ v, g: 0 })).concat(ys.map((v) => ({ v, g: 1 }))).sort((p, q) => p.v - q.v);
  let r1 = 0, tie = 0;
  for (let i = 0; i < all.length; ) {
    let j = i;
    while (j < all.length && all[j]!.v === all[i]!.v) j += 1;
    const rank = (i + 1 + j) / 2, t = j - i;
    for (let k = i; k < j; k += 1) if (all[k]!.g === 0) r1 += rank;
    tie += t ** 3 - t;
    i = j;
  }
  const u1 = r1 - (n1 * (n1 + 1)) / 2, u2 = n1 * n2 - u1, n = n1 + n2;
  const sd = Math.sqrt(((n1 * n2) / 12) * (n + 1 - tie / (n * (n - 1))));
  const z = sd > 0 ? (Math.abs(u1 - (n1 * n2) / 2) - 0.5) / sd : 0;
  return { u: Math.min(u1, u2), p: Math.min(1, Math.max(0, 2 * (1 - normCdf(Math.max(0, z))))), n1, n2 };
}

export function buildQuestion(q: { metric: string; cellType: string; grouping: string }): Question | null {
  const metric = metricOf(q.metric);
  const cell = cellOf(q.cellType);
  const grouping = groupingOf(q.grouping);
  const ser = seriesOf(q.metric, q.cellType);
  if (!metric || !grouping || !ser) return null;
  const rows: Row[] = data.donors
    .map((donor, i) => ({ donor, value: ser.values[i] as number }))
    .filter((r) => isNum(r.value));
  const order = grouping.order.length ? grouping.order : [...new Set(rows.map((r) => r.donor[grouping.key] ?? ""))];
  const groups: Group[] = order.map((name) => {
    const mine = rows.filter((r) => String(r.donor[grouping.key]) === String(name));
    return { name: String(name), rows: mine, ...summary(mine.map((r) => r.value)) };
  });
  const live = groups.filter((g) => g.n > 0);
  const first = live[0] ?? null;
  const last = live[live.length - 1] ?? null;
  let trend: Question["trend"] = "same";
  if (first && last && first !== last) {
    const spread = live.reduce((a, g) => a + (g.q3 - g.q1), 0) / live.length || 1;
    const diff = last.median - first.median;
    trend = Math.abs(diff) < 0.5 * spread ? "same" : diff > 0 ? "up" : "down";
  }
  const dec = isNum(metric.decimals) ? metric.decimals : 1;
  return {
    q, metric, cell, grouping, groups, first, last, trend, dec, unit: metric.unit,
    d: cohensD(first, last), fold: foldChange(first, last),
    mw: first && last && first !== last ? mannWhitney(first.rows.map((r) => r.value), last.rows.map((r) => r.value)) : null,
    max: Math.max(0, ...rows.map((r) => r.value)),
  };
}

export const shortUnit = (u: string) => (/^%/.test(String(u || "")) ? "%" : u);
export const minDonors = (): number => (isNum(data.lab.minDonorsPerGroup) ? data.lab.minDonorsPerGroup : 5);
export const enoughDonors = (Q: Question) => !!(Q.first && Q.last && Q.first !== Q.last && Q.first.n >= minDonors() && Q.last.n >= minDonors());

/** "about 1.4 times higher", "about the same" (0.9–1.1), "about 30% lower" */
export function foldWords(r: number): string {
  const w = data.lab.foldWords || {};
  if (!isNum(r)) return "";
  if (r >= 0.9 && r <= 1.1) return w.same || "";
  if (r > 1.1) return fill(w.higher, { foldTimes: num(Math.round(r * 10) / 10, 1) });
  return fill(w.lower, { foldPct: String(Math.max(1, Math.round((1 - r) * 100))) });
}

export function questionVars(Q: Question | null): Vars {
  if (!Q) return {};
  return {
    metricLabel: label(Q.metric), metricLower: lowerFirst(label(Q.metric)),
    groupingShort: isText(Q.grouping.shortName) ? Q.grouping.shortName : label(Q.grouping),
    cellLabel: label(Q.cell), groupingLabel: label(Q.grouping), unit: Q.unit,
    firstGroup: Q.first?.name, lastGroup: Q.last?.name,
    nFirst: Q.first ? qty(Q.first.n, donorUnit(), 0) : undefined, nLast: Q.last ? qty(Q.last.n, donorUnit(), 0) : undefined,
    medianFirst: Q.first ? qty(Q.first.median, Q.unit, Q.dec) : undefined,
    medianLast: Q.last ? qty(Q.last.median, Q.unit, Q.dec) : undefined,
    medianFirstShort: Q.first ? qty(Q.first.median, shortUnit(Q.unit), Q.dec) : undefined,
    medianLastShort: Q.last ? qty(Q.last.median, shortUnit(Q.unit), Q.dec) : undefined,
    nDonors: qty(Q.groups.reduce((a, g) => a + g.n, 0), donorUnit(), 0),
    trend: (data.lab.trendWords || {})[Q.trend] || Q.trend,
  };
}
export const questionText = (Q: Question) =>
  fill(data.lab.snapshotQuestion, questionVars(Q)) || [label(Q.metric), label(Q.cell), label(Q.grouping)].filter(Boolean).join(" · ");
export function yTitle(Q: Question) {
  const unit = Q.unit;
  const bare = String(unit).replace(/^%\s*/, "").toLowerCase();
  return bare && label(Q.metric).toLowerCase().includes(bare) ? unit : `${label(Q.metric)} (${unit})`;
}
export const axisTitle = (Q: Question) => (isText(Q.grouping.axisTitle) ? Q.grouping.axisTitle : label(Q.grouping));

/** A zero-based axis with exactly three tick marks above zero. */
export function niceAxis(maxValue: number) {
  const max = maxValue > 0 ? maxValue : 1;
  const rough = max / 3;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((m) => m * pow).find((c) => c * 3 >= max - 1e-9) ?? max / 3;
  return { max: step * 3, ticks: [1, 2, 3].map((k) => Number((k * step).toPrecision(10))) };
}

/* ---------- the lab ---------- */
export type Hyp = "up" | "same" | "down";
export type VerdictKey = "supported" | "contradicted" | "differenceFound" | "notSupported" | "consistentNotProven";
export type Evidence = "tooFew" | "detected" | "suggestive" | "none";
export interface LabStats {
  Q: Question; first: Group; last: Group; p: number; dir: Hyp; trendKey: Hyp; enough: boolean; evidence: Evidence; pText: string;
  view: { metric: string; cellType: string };
}
const sig2 = (p: number) => (p === 0 ? "0" : String(Number(p.toPrecision(2))));
export function labStats(cs: CaseStudy, viewIdx = 0): LabStats {
  const v = cs.views[viewIdx] ?? cs.views[0]!;
  const Q = buildQuestion({ metric: v.metric, cellType: v.cellType, grouping: cs.grouping })!;
  const first = Q.first!, last = Q.last!;
  const p = Q.mw ? Q.mw.p : 1;
  const dir: Hyp = last.median > first.median ? "up" : last.median < first.median ? "down" : "same";
  const trendKey: Hyp = !isNum(Q.fold) ? "same" : Q.fold > 1.1 ? "up" : Q.fold < 0.9 ? "down" : "same";
  const enough = enoughDonors(Q);
  const evidence: Evidence = !enough ? "tooFew" : p < 0.05 ? "detected" : p < 0.1 ? "suggestive" : "none";
  return { Q, first, last, p, dir, trendKey, enough, evidence, pText: sig2(p), view: v };
}
/** Which verdict a locked hypothesis earns. */
export function labVerdictKey(hyp: Hyp | null | undefined, p: number, dir: Hyp): VerdictKey {
  if (p < 0.05) return hyp === "same" ? "differenceFound" : hyp === dir ? "supported" : "contradicted";
  return hyp === "same" ? "consistentNotProven" : "notSupported";
}
const mulberry = (a: number) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hashStr = (str: string) => { let x = 2166136261; for (const ch of String(str)) { x ^= ch.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; };
const medianOf = (arr: number[]) => { const v = arr.slice().sort((a, b) => a - b), k = v.length; return k ? (k % 2 ? v[(k - 1) / 2]! : (v[k / 2 - 1]! + v[k / 2]!) / 2) : NaN; };
/** 200 seeded redraws inside each end group: how many keep the observed direction. */
export function labResample(cs: CaseStudy, S: LabStats) {
  const rnd = mulberry(20240 + (hashStr(cs.id + (S.view.metric || "")) % 997));
  const a = S.first.rows.map((r) => r.value), b = S.last.rows.map((r) => r.value);
  const sign = Math.sign(medianOf(b) - medianOf(a));
  const draw = (arr: number[]) => arr.map(() => arr[Math.floor(rnd() * arr.length)]!);
  let held = 0; const first5: number[] = [];
  for (let k = 0; k < 200; k += 1) {
    const d = medianOf(draw(b)) - medianOf(draw(a));
    if (Math.sign(d) === sign) held += 1;
    if (k < 5) first5.push(d);
  }
  return { held, first5 };
}
export function labVars(cs: CaseStudy, S: LabStats, hyp: Hyp | null | undefined, extra?: Vars): Vars {
  const lui = data.lab.ui;
  const short = (x: number) => qty(x, shortUnit(S.Q.unit), S.Q.dec);
  return {
    firstGroup: S.first.name, lastGroup: S.last.name, nFirst: String(S.first.n), nLast: String(S.last.n),
    medianFirst: short(S.first.median), medianLast: short(S.last.median),
    trend: lui.trend[S.trendKey], foldWords: foldWords(S.Q.fold), pValue: S.pText, held: String(labResample(cs, S).held),
    hypothesis: hyp ? lui.hypothesis[hyp] : "", measurePhrase: cs.measurePhrase,
    ...(extra || {}),
  };
}
export function labAbstract(cs: CaseStudy, S: LabStats, hyp: Hyp | null, verdict: VerdictKey) {
  const A = cs.abstract, vars = labVars(cs, S, hyp);
  return [A.background, A.aim, A.result, A.conclusion[verdict]].map((t) => fill(t, vars)).join(" ");
}
export type { Confounder };
