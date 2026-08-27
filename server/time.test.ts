import { describe, expect, it } from "vitest";
import { clockTimeToMinutes, formatClockTime, parseClockTime } from "../shared/time";

describe("clock time picker", () => {
  it("formats numeric hour with morning or evening period", () => {
    expect(formatClockTime({ hour: "9", minute: "15", period: "ص" })).toBe("09:15 ص");
    expect(formatClockTime({ hour: "7", minute: "45", period: "م" })).toBe("07:45 م");
  });

  it("reads legacy clock strings", () => {
    expect(parseClockTime("10:05 ص")).toEqual({ hour: "10", minute: "05", period: "ص" });
    expect(parseClockTime("08:30 م")).toEqual({ hour: "08", minute: "30", period: "م" });
    expect(clockTimeToMinutes({ hour: "08", minute: "30", period: "م" })).toBe(20 * 60 + 30);
  });
});
