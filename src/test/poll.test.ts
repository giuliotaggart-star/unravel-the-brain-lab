import { describe, expect, it } from "vitest";
import { scoreOf } from "@/lib/unravel/poll";

const items = [
  { id: "q1", correct: "true" as const },
  { id: "q2", correct: "false" as const },
  { id: "q3", correct: "false" as const },
];

describe("poll scoring", () => {
  it("counts only correct answers", () => {
    expect(scoreOf(items, { q1: "true", q2: "true", q3: "false" })).toBe(2);
  });
  it("never counts don't know or blanks as correct", () => {
    expect(scoreOf(items, { q1: "dk" })).toBe(0);
  });
});
