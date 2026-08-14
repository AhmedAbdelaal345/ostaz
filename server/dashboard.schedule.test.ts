import { describe, expect, it } from "vitest";
import { sortGroupsByTime } from "../shared/dashboard";

describe("dashboard daily schedule", () => {
  it("sorts today's lessons by time without mutating the source", () => {
    const source = [
      { day: "الخميس", time: "07:00 م", name: "مساء", place: "سنتر", students: 10 },
      { day: "الخميس", time: "09:30 ص", name: "صباح", place: "أونلاين", students: 8 },
    ];
    const sorted = sortGroupsByTime(source);
    expect(sorted.map(item => item.name)).toEqual(["صباح", "مساء"]);
    expect(source[0]?.name).toBe("مساء");
  });
});
