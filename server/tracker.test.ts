import { describe, expect, it } from "vitest";
import { formatRemainingLessonTime } from "../shared/tracker";

describe("formatRemainingLessonTime", () => {
  it("keeps near lessons compact in minutes", () => {
    expect(formatRemainingLessonTime(5)).toBe("5 د");
  });

  it("shows days before hours for a lesson more than one day away", () => {
    expect(formatRemainingLessonTime(2 * 24 * 60 + 3 * 60 + 15)).toBe("يومان و3 ساعة و15 دقيقة");
  });
});
