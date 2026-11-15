import { createContext, Fragment, useContext, useId, useRef, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cellColourVar, cellOf, data, fill, glossOf, isText, label, TOKEN, type Vars } from "@/lib/unravel/data";
import { cn } from "@/lib/utils";

/* Guided text. Copy in the data marks the words that carry the point:
   **strong**  [[glossary term]]  {cell:id} or {cell:id|words}  ==marker==  and {{tokens}} for live values. */
const RICH = /\*\*([^*]+)\*\*|\[\[([^\]]+)\]\]|\{cell:([a-z0-9-]+)(?:\|([^}]*))?\}|==([^=]+)==/g;

/** A glossary term is explained once per screen: the first text block that renders it owns it. */
const GlossaryCtx = createContext<{ owners: Map<string, string> } | null>(null);
export function GlossaryScope({ children }: { children: ReactNode }) {
  const ref = useRef<Map<string, string>>(new Map());
  return <GlossaryCtx.Provider value={{ owners: ref.current }}>{children}</GlossaryCtx.Provider>;
}

function Term({ text, plain }: { text: string; plain: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-help rounded-sm font-medium text-peri-ink underline decoration-peri/50 decoration-dotted decoration-2 underline-offset-4 transition-colors hover:decoration-peri focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
        >
          {text}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-auto max-w-xs rounded-xl border-border p-3 text-sm leading-relaxed shadow-lift">
        <span className="kicker mb-1 block">{text}</span>
        {plain}
      </PopoverContent>
    </Popover>
  );
}

function badTokens(str: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  str.replace(TOKEN, (whole, _n, at: number) => {
    if (at > last) out.push(str.slice(last, at));
    out.push(
      <mark key={`${key}-bt${i++}`} className="rounded bg-destructive/15 px-1 font-mono text-[0.85em] text-destructive">
        {whole}
      </mark>,
    );
    last = at + whole.length;
    return whole;
  });
  if (last < str.length) out.push(str.slice(last));
  return out;
}

export function useRich() {
  const scope = useContext(GlossaryCtx);
  const id = useId();
  const local = useRef(new Set<string>());
  const owns = (term: string) => {
    const k = term.toLowerCase();
    if (scope) {
      const o = scope.owners.get(k);
      if (!o) {
        scope.owners.set(k, id);
        return true;
      }
      return o === id;
    }
    if (local.current.has(k)) return false;
    local.current.add(k);
    return true;
  };

  const autoTerms = (str: string, key: string, auto: boolean): ReactNode[] => {
    if (!auto) return badTokens(str, key);
    const terms = data.glossary
      .filter((g) => isText(g.term) && g.term !== "PLACEHOLDER" && isText(g.plain))
      .sort((a, b) => b.term.length - a.term.length);
    if (!terms.length) return badTokens(str, key);
    const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("\\b(" + terms.map((g) => esc(g.term)).join("|") + ")\\b", "i");
    const out: ReactNode[] = [];
    let rest = str;
    let k = 0;
    for (;;) {
      const m = re.exec(rest);
      if (!m) {
        out.push(...badTokens(rest, `${key}-r${k}`));
        break;
      }
      const g = glossOf(m[1]!);
      out.push(...badTokens(rest.slice(0, m.index), `${key}-p${k}`));
      out.push(g && owns(g.term) ? <Term key={`${key}-t${k}`} text={m[1]!} plain={g.plain} /> : m[1]!);
      rest = rest.slice(m.index + m[1]!.length);
      k += 1;
    }
    return out;
  };

  return (template: string | undefined, vars?: Vars, auto = true): ReactNode[] => {
    if (!isText(template)) return [];
    const str = fill(template, vars);
    const out: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let n = 0;
    RICH.lastIndex = 0;
    while ((m = RICH.exec(str)) !== null) {
      if (m.index > last) out.push(...autoTerms(str.slice(last, m.index), `s${n}`, auto));
      const key = `m${n}`;
      if (m[1] !== undefined) out.push(<strong key={key} className="font-semibold text-foreground">{m[1]}</strong>);
      else if (m[2] !== undefined) {
        const g = glossOf(m[2]);
        out.push(g && owns(g.term) ? <Term key={key} text={m[2]} plain={g.plain} /> : <Fragment key={key}>{m[2]}</Fragment>);
      } else if (m[3] !== undefined) {
        const c = cellOf(m[3]);
        const text = isText(m[4]) ? m[4] : (c && (c.plain || label(c))) || m[3];
        out.push(
          <strong key={key} className="font-semibold" style={{ color: `color-mix(in oklab, ${cellColourVar(m[3])} 82%, var(--foreground))` }}>
            {text}
          </strong>,
        );
      } else if (m[5] !== undefined) out.push(<mark key={key} className="marker-hl">{m[5]}</mark>);
      last = m.index + m[0].length;
      n += 1;
    }
    if (last < str.length) out.push(...autoTerms(str.slice(last), `e${n}`, auto));
    return out;
  };
}

export function Rich({ text, vars, auto = true, className, as: Tag = "span" }: { text: string | undefined; vars?: Vars; auto?: boolean; className?: string; as?: "span" | "p" | "div" | "h2" | "h3" }) {
  const rich = useRich();
  if (!isText(text)) return null;
  return <Tag className={cn(className)}>{rich(text, vars, auto)}</Tag>;
}
