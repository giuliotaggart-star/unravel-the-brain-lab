import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Compass, Menu, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { chapters, chapterIndex, groups, links, steps, type Chapter } from "@/lib/unravel/chapters";
import { Thread } from "./Thread";
import { data, fmtDate, isText, isUrl, ui } from "@/lib/unravel/data";
import { store, useStored } from "@/lib/unravel/store";
import { cn } from "@/lib/utils";

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


/** The full site map: four groups; the lesson lists its numbered steps, the others their pages. Used by the menu and the home page. */
export function SiteMap({ onPick, current }: { onPick?: () => void; current?: string }) {
  const sub = "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted";
  return (
    <ol className="space-y-2">
      {groups.map((g, i) => {
        const lesson = g.id === "practice";
        return (
          <li key={g.id}>
            <Link
              to={g.to}
              onClick={onPick}
              className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors", lesson ? "border-go/30 bg-go-soft hover:bg-go/15" : "border-border bg-card hover:bg-muted")}
            >
              <span className={cn("font-mono text-xs", lesson ? "text-go-ink" : "text-muted-foreground")}>{i + 1}</span>
              <span className="font-semibold">{g.label}</span>
            </Link>
            {lesson ? (
              <ol className="ml-6 mt-1.5 space-y-0.5 border-l-2 border-go/25 pl-3">
                {steps.filter((st) => !st.standalone).map((st) => (
                  <li key={st.name}>
                    <Link to={st.to} onClick={onPick} className={cn(sub, current === st.to ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      <span className="font-mono text-[0.7rem]">{st.n}</span>
                      {st.name}
                    </Link>
                  </li>
                ))}
              </ol>
            ) : g.items && g.items.length > 0 ? (
              <ul className="ml-6 mt-1.5 space-y-0.5 border-l-2 border-border pl-3">
                {g.items.map((it) => (
                  <li key={it.id}>
                    <Link to={it.to} onClick={onPick} className={cn(sub, it.gold && "bg-gold-soft text-foreground hover:bg-gold/25", current === it.to ? "font-semibold text-foreground" : !it.gold && "text-muted-foreground")}>
                      {it.id === "explore" ? <Compass className="size-3.5 text-peri-ink" aria-hidden /> : it.gold ? <Trophy className="size-3.5 text-gold-ink" aria-hidden /> : <span className="size-1.5 rounded-full bg-muted-foreground/40" aria-hidden />}
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = chapters.find((c) => c.to === path);
  const inPractice = !!current;
  const progress = useScrollProgress();
  const [open, setOpen] = useState(false);
  const numbered = steps.filter((s) => !s.standalone);
  const solo = steps.find((s) => s.standalone);
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:shadow-lift">
        {ui("skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="relative inline-block shrink-0 pb-3 text-xl leading-none" aria-label={data.meta.title}>
          <Brand />
          <Thread small delay={0.1} className="absolute -bottom-1 left-0 w-full" />
        </Link>
        <Link
          to="/about"
          className={cn("ml-4 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", path === "/about" ? "bg-go text-go-foreground" : "text-foreground hover:bg-muted")}
        >
          {ui("about")}
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button type="button" className="ml-auto flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold shadow-card transition-colors hover:border-go/40">
              <Menu className="size-4" aria-hidden />
              {ui("menu")}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm border-border bg-background p-0">
            <SheetTitle className="sr-only">{ui("menu")}</SheetTitle>
            <div className="flex h-full flex-col overflow-y-auto p-6 pt-14">
              <SiteMap onPick={() => setOpen(false)} current={path} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {inPractice && (
        <div className="border-t border-border/60">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-1">
              {numbered.map((st, j) => {
                const on = current?.step === steps.indexOf(st);
                const done = !current?.standalone && (current?.step ?? -1) > steps.indexOf(st);
                return (
                  <li key={st.n} className="flex shrink-0 items-center">
                    {j > 0 && <span className={cn("mx-1 h-px w-4 sm:w-8", done || on ? "bg-go/60" : "bg-border")} aria-hidden />}
                    <Link to={st.to} aria-current={on ? "step" : undefined} className={cn("flex items-center gap-2 rounded-full px-3 py-1 text-[0.8rem] font-semibold transition-colors", on ? "bg-go text-go-foreground shadow-card" : "text-muted-foreground hover:text-foreground")}>
                      <span className={cn("font-mono text-[0.7rem]", on ? "text-go-foreground/80" : done ? "text-go-ink" : "text-muted-foreground/70")}>{st.n}</span>
                      <span className="whitespace-nowrap">{st.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            {solo && (
              <Link to={solo.to} aria-current={current?.standalone ? "page" : undefined} className={cn("ml-auto flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold transition-colors", current?.standalone ? "border-peri bg-peri text-primary-foreground" : "border-peri/30 bg-peri-soft text-peri-ink hover:border-peri/60")}>
                <Compass className="size-3.5" aria-hidden />
                <span className="whitespace-nowrap">{solo.name}</span>
              </Link>
            )}
          </div>
        </div>
      )}
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
  const navigate = useNavigate();
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
                  void navigate({ to: "/poll" });
                }}
              >
                {data.poll.retakeLabel}
              </button>
            </p>
          )}
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacy" className="font-medium text-peri-ink underline decoration-peri/30 underline-offset-2 hover:decoration-peri">{f["privacyLink"]}</Link>
            <Link to="/terms" className="font-medium text-peri-ink underline decoration-peri/30 underline-offset-2 hover:decoration-peri">{f["termsLink"]}</Link>
          </p>
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
            {c.standalone ? (
              <span className="flex h-8 items-center gap-1.5 rounded-lg bg-peri-soft px-2.5 text-sm font-semibold text-peri-ink"><Compass className="size-4" aria-hidden />{c.name}</span>
            ) : (
              <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-go px-2 font-mono text-sm text-go-foreground">{c.n}</span>
            )}
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

/** One way forward: a filled "Next" card. Going back is via About in the header. */
export function ChapterPager({ id }: { id: string }) {
  const i = chapterIndex(id);
  const next: Chapter | undefined = chapters[i + 1];
  const prize = links.find((g) => g.id === "prize");
  const link = "group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground";
  return (
    <nav aria-label={ui("sections")} className="mx-auto mt-16 flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
      {next ? (
        <Link to={next.to} className={link}>
          <span>{ui("skipAhead")}</span>
          <span className="font-semibold text-foreground">{next.step === chapters[i]!.step ? next.name : steps[next.step]!.name}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      ) : prize ? (
        <Link to={prize.to} className={cn(link, "border-gold/50")}>
          <span>{ui("skipAhead")}</span>
          <span className="font-semibold text-foreground">{prize.label}</span>
          <Trophy className="size-3.5 text-gold-ink" aria-hidden />
        </Link>
      ) : null}
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
