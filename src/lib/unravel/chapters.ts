import { data } from "./data";

export type ChapterPath = "/about" | "/poll" | "/what-dementia-is" | "/data" | "/lab" | "/explore";
export type GroupPath = "/about" | "/poll" | "/prize" | "/ucas" | "/teachers" | "/contact";

const PATHS: Record<string, ChapterPath> = {
  about: "/about",
  poll: "/poll",
  pivot: "/what-dementia-is",
  video: "/data",
  lab: "/lab",
  explore: "/explore",
};

export interface Chapter {
  id: string;
  to: ChapterPath;
  n: string;
  name: string;
  step: number;
  standalone: boolean;
  kicker?: string;
  title?: string;
  line?: string;
}
export interface Step { n: string; name: string; to: ChapterPath; ids: string[]; standalone: boolean }
export interface Group { id: string; label: string; to: GroupPath }

const J = (data as any).journey as { groups: Group[]; steps: { name: string; sections: string[]; standalone?: boolean }[] };

// Numbered steps count 01, 02…; a standalone step (Solo explore) has no number.
const num = (i: number) => (J.steps[i]!.standalone ? "" : String(J.steps.slice(0, i + 1).filter((s) => !s.standalone).length).padStart(2, "0"));
export const groups: Group[] = J.groups;

export const steps: Step[] = J.steps.map((s, i) => ({ n: num(i), name: s.name, to: PATHS[s.sections[0]!]!, ids: s.sections, standalone: !!s.standalone }));

export const chapters: Chapter[] = J.steps.flatMap((s, i) =>
  s.sections.map((id) => {
    const sec = data.sections.find((x: any) => x.id === id) ?? {};
    return { id, to: PATHS[id]!, n: num(i), step: i, standalone: !!s.standalone, name: sec.name ?? s.name, kicker: sec.kicker, title: sec.title, line: sec.line };
  }),
);

export const chapterById = (id: string) => chapters.find((c) => c.id === id)!;
export const chapterIndex = (id: string) => chapters.findIndex((c) => c.id === id);
