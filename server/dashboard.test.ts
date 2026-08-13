import { describe, expect, it } from "vitest";
import { getNextGroupForDay } from "../shared/dashboard";

describe("dashboard next group", () => {
  it("selects the earliest class for the requested day", () => {
    const groups = [
      { name: "مساء", day: "الخميس", time: "07:00 م", place: "سنتر", students: 10 },
      { name: "صباح", day: "الخميس", time: "09:30 ص", place: "أونلاين", students: 8 },
      { name: "أحد", day: "الأحد", time: "08:00 م", place: "سنتر", students: 5 },
    ];
    expect(getNextGroupForDay(groups, "الخميس")?.name).toBe("صباح");
    expect(getNextGroupForDay(groups, "السبت")).toBeUndefined();
  });
});
