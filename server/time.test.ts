import { describe, expect, it } from "vitest";
import { formatClockTime, parseClockTime } from "../shared/time";

describe("clock time picker", () => {
  it("formats numeric hour with morning or evening period", () => {
    expect(formatClockTime({ hour: "9", period: "ص" })).toBe("09:00 ص");
    expect(formatClockTime({ hour: "7", period: "م" })).toBe("07:00 م");
  });

  it("reads legacy clock strings", () => {
    expect(parseClockTime("10:00 ص")).toEqual({ hour: "10", period: "ص" });
    expect(parseClockTime("08:00 م")).toEqual({ hour: "08", period: "م" });
  });
});
