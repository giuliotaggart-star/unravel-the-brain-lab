import raw from "@/data/seaad-mtg.json";
import type { CellType, Grouping, Metric, UnravelData } from "./types";

export const data = raw as unknown as UnravelData;

export const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
export const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
export const isUrl = (v: unknown): v is string => isText(v) && /^https:\/\//.test(v);

export function num(v: number, digits = 1): string {
  if (!isNum(v)) return "";
  let d = digits;
  while (v !== 0 && d < 6 && Number(v.toFixed(d)) === 0) d += 1;
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: d }).format(v);
}
/** A number never appears without its unit. */
export function qty(v: number | string, unit: string | undefined, digits = 1): string {
  const shown = isNum(v) ? num(v, digits) : isText(v) ? v : "";
  if (shown === "") return "";
  const u = isText(unit) ? unit : data.ui["unitMissing"] ?? "";
  return shown + (/^[%°]/.test(u) ? "" : " ") + u;
}
export function fmtDate(v: string | undefined): string {
  if (!isText(v) || !/^\d{4}-\d{2}-\d{2}/.test(v)) return isText(v) ? v : "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export type Vars = Record<string, string | number | undefined | null>;
export const TOKEN = /\{\{\s*([A-Za-z0-9]+)\s*\}\}/g;

export function baseVars(): Vars {
  const p = data.prize || {};
  const m = data.meta || {};
  const bare = (o: any) => (o && isNum(o.value) ? num(o.value, 0) : "");
  return {
    prizeValue: p.value,
    wordsMin: p.wordsMin,
    wordsMax: p.wordsMax,
    donorTotal: bare(m.donorTotal),
    cellsTotal: bare(m.cellsTotal),
    deadline: fmtDate(data.config?.["essayDeadline"]),
  };
}
export function lookup(name: string, vars?: Vars): string | undefined {
  const all = { ...baseVars(), ...(vars || {}) };
  const v = all[name];
  return v === undefined || v === null || v === "" ? undefined : String(v);
}
/** Fill {{tokens}}; unknown tokens are left in place so they stay visible. */
export function fill(template: string | undefined, vars?: Vars): string {
  if (!isText(template)) return "";
  return template.replace(TOKEN, (whole, name: string) => lookup(name, vars) ?? whole);
}

export const label = (x: { plainLabel?: string; label?: string; id?: string } | null | undefined) =>
  x ? (isText(x.plainLabel) ? x.plainLabel : x.label) || x.id || "" : "";
export const tech = (x: { plainLabel?: string; label?: string } | null | undefined) =>
  x && isText(x.label) && x.label !== label(x) ? x.label : "";
export const lowerFirst = (t: string) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);

const byId = <T extends { id: string }>(arr: T[], id: string | undefined) => arr.find((x) => x.id === id) ?? null;
export const metricOf = (id?: string): Metric | null => byId(data.metrics, id);
export const cellOf = (id?: string): CellType | null => byId(data.cellTypes, id);
export const groupingOf = (id?: string): Grouping | null => byId(data.groupings, id);
export const caseOf = (id?: string) => byId(data.caseStudies, id);
export const seriesOf = (metric?: string, cellType?: string) =>
  data.series.find((x) => x.metric === metric && x.cellType === cellType && Array.isArray(x.values)) ?? null;
export const glossOf = (term: string) =>
  data.glossary.find((g) => isText(g.term) && isText(g.plain) && g.term.toLowerCase() === term.toLowerCase()) ?? null;
export const donorUnit = (): string => data.meta?.donorTotal?.unit ?? "";
export const ui = (k: string) => data.ui[k] ?? "";
export const LAB = () => data.lab;
export const LUI = () => data.lab.ui;

/** Light-theme colour for each cell type (design layer; the data colours were tuned for a dark page). */
export const cellColourVar = (id?: string) => `var(--cell-${id ?? "default"}, var(--peri))`;

/** "% of neurons" becomes "%" where the label already says what is counted. */
export const shortUnitSafe = (u: string) => (/^%/.test(String(u || "")) ? "%" : u);
