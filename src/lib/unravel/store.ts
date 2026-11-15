import { useCallback, useEffect, useState } from "react";

/* Device storage: only the poll result, lab progress, saved findings and the essay draft. Nothing leaves the device. */
const PREFIX = "unravel.";
const EVT = "unravel-store";

export const store = {
  get<T>(k: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + k);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(PREFIX + k, JSON.stringify(v));
    } catch {
      /* storage blocked: carry on in memory */
    }
    window.dispatchEvent(new CustomEvent(EVT, { detail: k }));
  },
  del(k: string) {
    try {
      localStorage.removeItem(PREFIX + k);
    } catch {
      /* nothing to clear */
    }
    window.dispatchEvent(new CustomEvent(EVT, { detail: k }));
  },
};

/** State mirrored to localStorage. Reads after hydration so the server and first client render match. */
export function useStored<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => {
      const v = store.get<T>(key);
      setValue(v === null ? initial : v);
    };
    read();
    setReady(true);
    const on = (e: Event) => {
      if ((e as CustomEvent).detail === key) read();
    };
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        queueMicrotask(() => {
          if (v === null || v === undefined) store.del(key);
          else store.set(key, v);
        });
        return v;
      });
    },
    [key],
  );
  return [value, set, ready];
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
