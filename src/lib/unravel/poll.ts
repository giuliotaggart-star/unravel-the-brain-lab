import { data, isUrl } from "./data";
import { store } from "./store";

export type Answer = "true" | "false" | "dk";
export interface PollItem { id: string; statement: string; correct: Answer; why: string }
export interface StartPoll { kind: "start"; at: string; anonId: string; classCode: string; year: string; answers: Record<string, Answer>; conf: Record<string, number>; score: number }
export interface ExitPoll { kind: "exit"; at: string; anonId: string; classCode: string; answers: Record<string, Answer>; conf: Record<string, number>; r1: number | null; e1: number | null; e2: string; e3: string[]; e4: string; score: number }

export const KEYS: Answer[] = ["true", "false", "dk"];

/** Number of statements answered correctly; "don't know" and blanks never count. */
export function scoreOf(items: Pick<PollItem, "id" | "correct">[], answers: Record<string, Answer | undefined>): number {
  return items.filter((i) => answers[i.id] === i.correct).length;
}

/** Random anonymous id kept on this device so the start and exit polls pair up without a name. */
export function anonId(): string {
  const have = store.get<string>("anonId");
  if (have) return have;
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  store.set("anonId", id);
  return id;
}

/** Fire-and-forget send to the optional collection address; nothing is sent when it is not set. */
export function sendPoll(row: StartPoll | ExitPoll) {
  const endpoint = data.config["pollEndpoint"];
  if (!isUrl(endpoint)) return;
  try {
    fetch(endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(row) }).catch(() => {});
  } catch {
    /* offline: kept on the device */
  }
}
export const pollEndpointOn = () => isUrl(data.config["pollEndpoint"]);
