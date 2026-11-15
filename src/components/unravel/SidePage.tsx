import type { ReactNode } from "react";
import { PageWrap } from "./Shell";

export function SidePage({ heading, intro, children }: { heading: string; intro?: string; children: ReactNode }) {
  return (
    <div>
      <div className="border-b border-border bg-surface">
        <PageWrap className="pb-12 pt-14 sm:pt-20">
          <h1 className="font-display-tight text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-none">{heading}</h1>
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
