import { data, isText } from "./data";
import { questionText, type Question } from "./stats";

/* Pictures out: the chart (or a research snapshot card) as a PNG, drawn on a white card with the wordmark. */
const PROPS = ["fill", "stroke", "fill-opacity", "stroke-opacity", "opacity", "font-family", "font-size", "font-weight", "letter-spacing"] as const;

function inlineStyles(src: Element, dst: Element) {
  const cs = getComputedStyle(src);
  for (const p of PROPS) {
    const v = cs.getPropertyValue(p);
    if (v) (dst as SVGElement).setAttribute(p, v);
  }
  (dst as SVGElement).removeAttribute("style");
  for (let i = 0; i < src.children.length; i += 1) inlineStyles(src.children[i]!, dst.children[i]!);
}

function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  inlineStyles(svg, clone);
  const vb = svg.viewBox.baseVal;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(vb.width));
  clone.setAttribute("height", String(vb.height));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  });
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = "";
  let yy = y;
  for (const word of text.split(/\s+/)) {
    const next = line ? line + " " + word : word;
    if (g.measureText(next).width > max && line) {
      g.fillText(line, x, yy);
      line = word;
      yy += lh;
    } else line = next;
  }
  if (line) g.fillText(line, x, yy);
  return yy + lh;
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export async function composeCard(Q: Question, svg: SVGSVGElement, withStats: boolean): Promise<Blob | null> {
  const lab = data.lab;
  try {
    await Promise.all([document.fonts.load('40px "Bagel Fat One"'), document.fonts.load('12px "DM Mono"'), document.fonts.load('600 20px "Plus Jakarta Sans"')]);
  } catch {
    /* draw with what is there */
  }
  const img = await svgToImage(svg);
  const pad = 44;
  const Wc = Math.max(900, img.width + pad * 2);
  const tableH = withStats ? 50 + (Q.groups.length + 1) * 28 : 0;
  const Hc = pad + 70 + (withStats ? 30 : 0) + 80 + img.height + tableH + 120;
  const canvas = document.createElement("canvas");
  canvas.width = Wc * 2;
  canvas.height = Hc * 2;
  const g = canvas.getContext("2d")!;
  g.scale(2, 2);
  const fg = css("--foreground") || "#0F172A";
  const muted = css("--muted-foreground") || "#64748B";
  const coral = css("--coral") || "#E15B50";
  g.fillStyle = css("--background") || "#FBFBFA";
  g.fillRect(0, 0, Wc, Hc);
  g.fillStyle = css("--card") || "#fff";
  g.fillRect(16, 16, Wc - 32, Hc - 32);
  const sans = '"Plus Jakarta Sans", system-ui, sans-serif';
  const mono = '"DM Mono", ui-monospace, monospace';
  let y = pad;
  g.font = '400 36px "Bagel Fat One", sans-serif';
  let x = pad;
  for (const ch of String(data.meta.title).toUpperCase()) {
    g.fillStyle = ch === "A" ? coral : fg;
    g.fillText(ch, x, y + 34);
    x += g.measureText(ch).width;
  }
  y += 70;
  if (withStats && isText(lab.snapshotTitle)) {
    g.fillStyle = muted;
    g.font = `400 13px ${mono}`;
    g.fillText(String(lab.snapshotTitle).toUpperCase(), pad, y);
    y += 30;
  }
  g.fillStyle = fg;
  g.font = `600 22px ${sans}`;
  y = wrap(g, questionText(Q), pad, y + 10, Wc - 2 * pad, 30) + 8;
  g.drawImage(img, pad, y);
  y += img.height + 20;
  if (withStats) {
    const cols = lab.tableColumns || {};
    const heads = [Q.grouping.plainLabel || Q.grouping.label, cols.n, `${cols.median} (${Q.unit})`, `${cols.iqr} (${Q.unit})`];
    const f = (v: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: Q.dec + 1 }).format(v);
    const rows = Q.groups.map((gr) => [gr.name, String(gr.n), gr.n ? f(gr.median) : "–", gr.n ? `${f(gr.q1)} – ${f(gr.q3)}` : "–"]);
    const colW = (Wc - 2 * pad) / heads.length;
    g.font = `700 14px ${sans}`;
    g.fillStyle = muted;
    heads.forEach((t, i) => g.fillText(String(t), pad + i * colW, y + 14));
    y += 30;
    g.font = `400 14px ${sans}`;
    g.fillStyle = fg;
    rows.forEach((r) => {
      r.forEach((t, i) => g.fillText(t, pad + i * colW, y + 14));
      y += 28;
    });
    y += 12;
  }
  g.fillStyle = muted;
  g.font = `400 13px ${sans}`;
  const m = data.meta;
  y = wrap(g, [lab.dotNote, [m.source, m.dataset, m.citation].filter(isText).join(" · ")].filter(isText).join(" "), pad, y + 10, Wc - 2 * pad, 18);
  if (m.PLACEHOLDER) {
    g.fillStyle = coral;
    g.font = `700 13px ${sans}`;
    wrap(g, m.placeholderNotice, pad, y + 4, Wc - 2 * pad, 18);
  }
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export const fileStem = (Q: Question) => ["unravel", Q.q.metric, Q.q.cellType, Q.q.grouping].join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "-");

export function saveBlob(blob: Blob | null, name: string) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
