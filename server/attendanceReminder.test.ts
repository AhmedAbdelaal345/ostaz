import { describe, expect, it } from "vitest";
import { shouldPromptLateAttendanceReview } from "../shared/attendanceReminder";

describe("late attendance review reminder", () => {
  it("notifies only in the final ten minutes when there are late students", () => {
    expect(shouldPromptLateAttendanceReview(10, 1)).toBe(true);
    expect(shouldPromptLateAttendanceReview(4, 3)).toBe(true);
    expect(shouldPromptLateAttendanceReview(11, 2)).toBe(false);
    expect(shouldPromptLateAttendanceReview(8, 0)).toBe(false);
    expect(shouldPromptLateAttendanceReview(0, 1)).toBe(false);
  });
});
