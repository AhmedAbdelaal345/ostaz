import { describe, expect, it } from "vitest";
import { getReminderDelayMinutes, parseLocalReminderDateTime } from "../shared/reminderTiming";

describe("reminder timing", () => {
  it("rounds a future reminder up to the displayed remaining minute", () => {
    const now = new Date("2026-08-25T06:00:20.000Z");
    expect(getReminderDelayMinutes(new Date("2026-08-25T06:01:00.000Z"), now)).toBe(1);
    expect(getReminderDelayMinutes(new Date("2026-08-25T06:02:21.000Z"), now)).toBe(3);
  });

  it("identifies a past reminder", () => {
    expect(getReminderDelayMinutes(new Date("2026-08-25T05:59:00.000Z"), new Date("2026-08-25T06:00:00.000Z"))).toBeLessThan(0);
  });

  it("parses a local input without appending a UTC timezone", () => {
    const parsed = parseLocalReminderDateTime("2026-08-27T09:00");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(27);
    expect(parsed.getHours()).toBe(9);
    expect(parsed.getMinutes()).toBe(0);
  });
});
