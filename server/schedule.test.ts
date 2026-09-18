import { describe, expect, it } from "vitest";
import { countScheduledLessons, parseSchedule, scheduleForGroup, serializeSchedule } from "../shared/schedule";

describe("group schedules", () => {
  it("preserves multiple selected days and custom times", () => {
    const entries = [
      { day: "السبت", time: "06:00 م" },
      { day: "الإثنين", time: "07:30 م" },
      { day: "الخميس", time: "05:00 م" },
    ];
    const encoded = serializeSchedule(entries);
    expect(parseSchedule(encoded, "الأحد", "08:00 م")).toEqual(entries);
  });

  it("counts every scheduled day, not only every group", () => {
    expect(countScheduledLessons([
      { day: "السبت", time: "06:00 م", scheduleJson: serializeSchedule([{ day: "السبت", time: "06:00 م" }, { day: "الإثنين", time: "07:30 م" }]) },
      { day: "الخميس", time: "05:00 م", scheduleJson: null },
    ])).toBe(3);
  });

  it("falls back to legacy day and time columns", () => {
    expect(parseSchedule(null, "الأحد", "08:00 م")).toEqual([{ day: "الأحد", time: "08:00 م" }]);
    expect(scheduleForGroup({ day: "الثلاثاء", time: "07:00 م", scheduleJson: null })).toEqual([{ day: "الثلاثاء", time: "07:00 م" }]);
  });

  it("prefers the newly persisted scheduleJson over a stale local schedule array", () => {
    expect(scheduleForGroup({
      day: "الثلاثاء",
      time: "07:00 م",
      schedule: [{ day: "الثلاثاء", time: "07:00 م" }],
      scheduleJson: serializeSchedule([{ day: "الثلاثاء", time: "08:30 م" }]),
    })).toEqual([{ day: "الثلاثاء", time: "08:30 م" }]);
  });
});
