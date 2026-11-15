import type { ReactNode } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageWrap } from "./Shell";

/** `gold` is reserved for the competition: it is always shown in gold. */
export function SidePage({ heading, intro, children, gold = false, tag }: { heading: string; intro?: string; children: ReactNode; gold?: boolean; tag?: string }) {
  return (
    <div>
      <div className={cn("border-b", gold ? "border-gold/40 bg-gold-soft" : "border-border bg-surface")}>
        <PageWrap className="pb-12 pt-14 sm:pt-20">
          {gold && <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-gold text-foreground"><Trophy className="size-5" aria-hidden /></span>}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <h1 className="font-display-tight text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-none">{heading}</h1>
            {tag && (
              <span className={cn("rounded-full px-5 py-2 font-display-tight text-2xl font-semibold leading-none sm:text-3xl", gold ? "bg-gold text-gold-ink" : "bg-go text-go-foreground")}>
                {tag}
              </span>
            )}
          </div>
          {intro && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
        </PageWrap>
      </div>
      <PageWrap className="mt-12 max-w-4xl space-y-12">{children}</PageWrap>
    </div>
  );
}
export function PSec({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      {title && <h2 className="font-display-tight text-3xl font-medium">{title}</h2>}
      {children}
    </section>
  );
}
export const Ticks = ({ items }: { items: ReactNode[] }) => (
  <ul className="space-y-2">
    {items.map((x, i) => (
      <li key={i} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-coral" />{x}</li>
    ))}
  </ul>
);
