import { data } from "./data";

export type ChapterPath = "/" | "/poll" | "/what-dementia-is" | "/data" | "/lab" | "/explore" | "/further";

const PATHS: Record<string, ChapterPath> = {
  question: "/",
  poll: "/poll",
  pivot: "/what-dementia-is",
  video: "/data",
  lab: "/lab",
  explore: "/explore",
  further: "/further",
};

export interface Chapter {
  id: string;
  to: ChapterPath;
  n: string;
  name: string;
  kicker?: string;
  title?: string;
  line?: string;
}

export const chapters: Chapter[] = data.sections
  .filter((s) => PATHS[s.id])
  .map((s, i) => ({ id: s.id, to: PATHS[s.id]!, n: String(i + 1).padStart(2, "0"), name: s.name, kicker: s.kicker, title: s.title, line: s.line }));

export const chapterById = (id: string) => chapters.find((c) => c.id === id)!;
export const chapterIndex = (id: string) => chapters.findIndex((c) => c.id === id);
