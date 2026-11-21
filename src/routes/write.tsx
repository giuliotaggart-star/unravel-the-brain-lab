import { createFileRoute, Link } from "@tanstack/react-router";
import { Bold, Heading2, HelpCircle, Italic, List, ListOrdered, PenLine, Underline } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/unravel/InsightGraphics";
import { SidePage, Ticks } from "@/components/unravel/SidePage";
import { data, fill } from "@/lib/unravel/data";
import { store } from "@/lib/unravel/store";

export const Route = createFileRoute("/write")({
  head: () => ({
    meta: [
      { title: "Write your report — Unravel" },
      { name: "description", content: "A simple writing space to turn your Solo explore findings into your own report." },
      { property: "og:title", content: "Write your report — Unravel" },
      { property: "og:description", content: "Write up your own findings from real Alzheimer's data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Write,
});

function Write() {
  const w = (data as any).write;
  const G = data.writing;
  const ed = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [, tick] = useState(0);
  const sync = () => {
    const el = ed.current; if (!el) return;
    store.set("report", el.innerHTML);
    const t = el.innerText.trim();
    setCount(t ? t.split(/\s+/).length : 0);
  };
  useEffect(() => {
    if (ed.current) ed.current.innerHTML = store.get<string>("report") || "";
    sync();
    const f = () => tick((n) => n + 1);
    document.addEventListener("selectionchange", f);
    return () => document.removeEventListener("selectionchange", f);
  }, []);
  const cmd = (c: string, v?: string) => { ed.current?.focus(); document.execCommand(c, false, v); sync(); };
  const on = (c: string) => { try { return typeof document !== "undefined" && document.queryCommandState(c); } catch { return false; } };
  const tools = [
    { c: "bold", i: Bold, l: w.bold }, { c: "italic", i: Italic, l: w.italic }, { c: "underline", i: Underline, l: w.underline },
    { c: "insertUnorderedList", i: List, l: w.bullets }, { c: "insertOrderedList", i: ListOrdered, l: w.numbered },
  ];
  const addHeadings = () => {
    const el = ed.current; if (!el) return;
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const have = new Set([...el.querySelectorAll("h2")].map((h) => h.textContent?.trim()));
    const add = G.sections.filter((x: any) => !have.has(x.name)).map((x: any) => `<h2>${esc(x.name)}</h2><p><br></p>`).join("");
    el.innerHTML = el.innerHTML + add;
    sync();
    toast(G.addHeadingsDone);
  };
  const btn = "inline-flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-peri-soft aria-pressed:bg-go aria-pressed:text-primary-foreground";
  return (
    <SidePage heading={w.heading} intro={w.intro}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card-surface min-w-0 overflow-hidden">
        <div role="toolbar" aria-label={w.heading} className="flex flex-wrap items-center gap-1 border-b border-border bg-surface p-2">
          <label className="sr-only" htmlFor="font">{w.font}</label>
          <select id="font" onChange={(e) => cmd("fontName", e.target.value)} className="mr-2 rounded-lg border border-border bg-card px-2 py-1.5 text-sm">
            {w.fonts.map((f: any) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          {tools.map(({ c, i: I, l }) => (
            <button key={c} type="button" title={l} aria-label={l} aria-pressed={on(c)} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd(c)} className={btn}><I className="size-4" /></button>
          ))}
          <button type="button" title={w.heading2} aria-label={w.heading2} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("formatBlock", "H2")} className={btn}><Heading2 className="size-4" /></button>
        </div>
        <div
          ref={ed}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          aria-label={w.heading}
          data-placeholder={w.placeholder}
          onInput={sync}
          className="report-editor min-h-[420px] p-6 leading-relaxed outline-none sm:p-8"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3">
          <span className="text-sm text-muted-foreground">{fill(w.words, { count })}</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="go" size="pillSm" onClick={addHeadings}>{G.addHeadings}</Button>
            <Button variant="soft" size="pillSm" onClick={() => navigator.clipboard?.writeText(ed.current?.innerText || "").then(() => toast(data.ui["copied"]), () => {})}>{w.copy}</Button>
            <Button variant="quiet" size="pillSm" onClick={() => { if (ed.current) ed.current.innerHTML = ""; sync(); }}>{w.clear}</Button>
          </div>
        </div>
      </div>
      <WritingGuide />
      </div>
      <div className="gold-shine flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 text-gold-ink">
        <p className="font-semibold">{fill(w.prizeBanner)}</p>
        <Button asChild variant="gold" size="pill"><Link to="/prize">{w.prizeBannerLink} →</Link></Button>
      </div>
      <Link to="/explore" className="text-sm font-semibold text-peri-ink hover:underline">← {w.back}</Link>
    </SidePage>
  );
}

/** Faded help: lots of tips and a sentence starter, then a tip and a question, then questions only. */
function WritingGuide() {
  const G = data.writing;
  const [lv, setLv] = useState(0);
  useEffect(() => setLv(store.get<number>("writeLevel") ?? 0), []);
  const pick = (v: string) => { const n = Number(v); setLv(n); store.set("writeLevel", n); };
  return (
    <aside className="card-surface h-fit space-y-4 p-5 lg:sticky lg:top-24">
      <div className="space-y-1">
        <p className="kicker">{G.heading}</p>
        <p className="text-sm text-muted-foreground">{G.intro}</p>
      </div>
      <Segmented label={G.heading} options={G.levels.map((l: string, i: number) => ({ id: String(i), label: l }))} value={String(lv)} onChange={pick} className="w-full" />
      <div className="divide-y divide-border rounded-xl border border-border">
        {G.sections.map((x: any) => (
          <details key={x.id} className="group px-3 py-2.5 open:bg-surface/60">
            <summary className="cursor-pointer list-none font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">{x.name}<span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">+</span></span>
            </summary>
            <div className="mt-2 space-y-2 text-sm leading-relaxed">
              {lv === 0 && (
                <>
                  {x.easy.learned && <p className="text-muted-foreground">{x.easy.learned}</p>}
                  <ul className="list-disc space-y-1 pl-5">{x.easy.tips.map((t: string) => <li key={t}>{t}</li>)}</ul>
                  {x.easy.starter && <p className="flex gap-2 text-muted-foreground"><PenLine className="mt-0.5 size-4 shrink-0" /><em>{x.easy.starter}</em></p>}
                </>
              )}
              {lv === 1 && (
                <>
                  <p>{x.medium.tip}</p>
                  <p className="flex gap-2 text-peri-ink"><HelpCircle className="mt-0.5 size-4 shrink-0" />{x.medium.question}</p>
                </>
              )}
              {lv === 2 && (
                <ul className="space-y-1">{x.hard.questions.map((q: string) => <li key={q} className="flex gap-2 text-peri-ink"><HelpCircle className="mt-0.5 size-4 shrink-0" />{q}</li>)}</ul>
              )}
            </div>
          </details>
        ))}
      </div>
      <div className="space-y-2">
        <p className="kicker">{G.styleHeading}</p>
        <Ticks items={G.style} />
      </div>
      <p className="text-xs text-muted-foreground">{G.sources}</p>
    </aside>
  );
}
