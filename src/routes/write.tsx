import { createFileRoute, Link } from "@tanstack/react-router";
import { Bold, Heading2, Italic, List, ListOrdered, Underline } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SidePage } from "@/components/unravel/SidePage";
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
  const btn = "inline-flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-peri-soft aria-pressed:bg-go aria-pressed:text-primary-foreground";
  return (
    <SidePage heading={w.heading} intro={w.intro}>
      <div className="card-surface overflow-hidden">
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
          <div className="flex gap-2">
            <Button variant="soft" size="pillSm" onClick={() => navigator.clipboard?.writeText(ed.current?.innerText || "").then(() => toast(data.ui["copied"]), () => {})}>{w.copy}</Button>
            <Button variant="quiet" size="pillSm" onClick={() => { if (ed.current) ed.current.innerHTML = ""; sync(); }}>{w.clear}</Button>
          </div>
        </div>
      </div>
      <Link to="/explore" className="text-sm font-semibold text-peri-ink hover:underline">← {w.back}</Link>
    </SidePage>
  );
}
