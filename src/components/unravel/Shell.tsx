import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { chapters, chapterIndex, type Chapter } from "@/lib/unravel/chapters";
import { data, fmtDate, isText, isUrl, ui } from "@/lib/unravel/data";
import { store, useStored } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

const SIDE = [
  { to: "/prize" as const, label: data.nav["prize"] },
  { to: "/ucas" as const, label: data.nav["ucas"] },
  { to: "/teachers" as const, label: data.nav["teachers"] },
];

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("font-brand tracking-wide text-foreground", className)}>
      {String(data.meta.title).toUpperCase().split("").map((ch: string, i: number) => (
        <span key={i} className={ch === "A" ? "text-coral" : undefined}>{ch}</span>
      ))}
    </span>
  );
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  return p;
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = chapters.findIndex((c) => c.to === path);
  const progress = useScrollProgress();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:shadow-lift">
        {ui("skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 text-xl" aria-label={data.meta.title}>
          <Brand />
        </Link>
        <nav aria-label={ui("sections")} className="mx-auto hidden min-w-0 lg:block">
          <ol className="flex items-center gap-1">
            {chapters.map((c, i) => {
              const on = i === current;
              const done = current > i;
              return (
                <li key={c.id}>
                  <Link
                    to={c.to}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition-colors",
                      on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {on && <motion.span layoutId="chapter-pill" className="absolute inset-0 rounded-full bg-peri-soft ring-1 ring-peri/25" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                    <span className={cn("relative font-mono text-[0.7rem] tabular-nums", on ? "text-peri-ink" : done ? "text-coral" : "text-muted-foreground/70")}>{c.n}</span>
                    <span className="relative whitespace-nowrap">{c.name}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <div className="hidden items-center gap-1 xl:flex">
            {SIDE.map((s) => (
              <Link key={s.to} to={s.to} className="rounded-full px-3 py-1.5 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" activeProps={{ className: "bg-muted text-foreground" }}>
                {s.label}
              </Link>
            ))}
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium shadow-card xl:hidden">
                <Menu className="size-4" aria-hidden />
                {ui("menu")}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm border-border bg-background p-0">
              <SheetTitle className="sr-only">{ui("menu")}</SheetTitle>
              <div className="flex h-full flex-col overflow-y-auto p-6">
                <p className="kicker mb-4">{ui("sections")}</p>
                <ol className="space-y-1">
                  {chapters.map((c, i) => (
                    <li key={c.id}>
                      <Link to={c.to} onClick={() => setOpen(false)} className={cn("flex items-baseline gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted", i === current && "bg-peri-soft")}>
                        <span className="font-mono text-xs text-muted-foreground">{c.n}</span>
                        <span className="font-medium">{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <p className="kicker mb-3 mt-8">{ui("site")}</p>
                <ul className="space-y-1">
                  {SIDE.map((s) => (
                    <li key={s.to}>
                      <Link to={s.to} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 font-medium transition-colors hover:bg-muted">
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="h-[3px] w-full bg-transparent" role="progressbar" aria-label={ui("progress")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <div className="h-full origin-left bg-gradient-to-r from-peri to-coral transition-transform duration-150 ease-out" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </header>
  );
}

const ExtLink = ({ href, children }: { href?: string; children: ReactNode }) =>
  isUrl(href) ? (
    <a href={href} target="_blank" rel="noopener" className="text-peri-ink underline decoration-peri/30 underline-offset-2 hover:decoration-peri">
      {children}
      <span className="sr-only"> {ui("newTab")}</span>
    </a>
  ) : (
    <>{children}</>
  );

export function SiteFooter() {
  const m = data.meta;
  const f = data.footer;
  const [poll] = useStored<any>("poll", null);
  const source = [m.source, m.dataset].filter(isText).join(" — ");
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-3">
          <Brand className="text-2xl" />
          <p className="max-w-xs text-sm text-muted-foreground">{data.hero["tagline"]}</p>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            {f["dataLabel"]} <ExtLink href={m.sourceUrl}>{source}</ExtLink>. <ExtLink href={m.citationUrl}>{m.citation}</ExtLink>.
          </p>
          <p>
            {f["licenceLabel"]} <ExtLink href={m.licenceUrl}>{m.licence}</ExtLink>.
          </p>
          <p>
            {f["accessedLabel"]} {fmtDate(m.accessed)}.
          </p>
          <p>{f["privacy"]}</p>
          {poll && (
            <p>
              <button
                type="button"
                className="font-medium text-peri-ink underline decoration-peri/30 underline-offset-2 hover:decoration-peri"
                onClick={() => {
                  store.del("poll");
                  window.location.assign("/poll");
                }}
              >
                {data.poll.retakeLabel}
              </button>
            </p>
          )}
          {m.PLACEHOLDER && isText(f["buildNote"]) && <p className="inline-block rounded-lg bg-coral-soft px-3 py-2 text-coral-ink">{f["buildNote"]}</p>}
        </div>
      </div>
    </footer>
  );
}

/** Chapter opener: a numbered kicker, the editorial title and one line under it. */
export function ChapterOpener({ id, heading, intro, children }: { id: string; heading?: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  const i = chapterIndex(id);
  const c = chapters[i]!;
  return (
    <div className="relative overflow-hidden border-b border-border bg-surface">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-center gap-3">
            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-coral/40 bg-card px-2 font-mono text-sm text-coral-ink">{c.n}</span>
            {c.kicker && <span className="kicker">{c.kicker}</span>}
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="kicker hidden sm:inline">{c.name}</span>
          </div>
          {c.title && <p className="font-display-tight mt-6 text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[0.95] text-foreground">{c.title}</p>}
          {c.line && <p className="mt-3 text-lg text-muted-foreground sm:text-xl">{c.line}</p>}
          {(heading || intro) && (
            <div className="mt-10 max-w-3xl space-y-3">
              {heading && <h1 className="font-display-tight text-3xl font-medium leading-tight sm:text-4xl">{heading}</h1>}
              {intro && <div className="text-lg leading-relaxed text-muted-foreground">{intro}</div>}
            </div>
          )}
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/** Previous / next chapter cards at the foot of every chapter. */
export function ChapterPager({ id }: { id: string }) {
  const i = chapterIndex(id);
  const prev: Chapter | undefined = chapters[i - 1];
  const next: Chapter | undefined = chapters[i + 1];
  return (
    <nav aria-label={ui("sections")} className="mx-auto mt-20 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
      {prev ? (
        <Link to={prev.to} className="card-surface group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
          <ArrowLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-1" aria-hidden />
          <span>
            <span className="kicker block">{prev.n}</span>
            <span className="font-semibold">{prev.name}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={next.to} className="card-surface group flex items-center justify-end gap-4 p-5 text-right transition-all hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-lift sm:col-start-2">
          <span>
            <span className="kicker block">{next.n}</span>
            <span className="font-semibold">{next.name}</span>
          </span>
          <ArrowRight className="size-5 text-coral transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </nav>
  );
}

export function PageWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function NumberedBlock({ n, label, children, className }: { n?: number; label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <p className="flex items-center gap-2.5">
        {n !== undefined && <span className="flex size-6 items-center justify-center rounded-md border border-coral/40 font-mono text-xs text-coral-ink">{n}</span>}
        <span className="kicker">{label}</span>
      </p>
      <div className="space-y-3 text-[1.02rem] leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}
