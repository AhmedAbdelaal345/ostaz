import { describe, expect, it } from "vitest";
import { getReminderDelayMinutes } from "../shared/reminderTiming";

describe("reminder timing", () => {
  it("rounds a future reminder up to the displayed remaining minute", () => {
    const now = new Date("2026-08-25T06:00:20.000Z");
    expect(getReminderDelayMinutes(new Date("2026-08-25T06:01:00.000Z"), now)).toBe(1);
    expect(getReminderDelayMinutes(new Date("2026-08-25T06:02:21.000Z"), now)).toBe(3);
  });

  it("identifies a past reminder", () => {
    expect(getReminderDelayMinutes(new Date("2026-08-25T05:59:00.000Z"), new Date("2026-08-25T06:00:00.000Z"))).toBeLessThan(0);
  });
});
