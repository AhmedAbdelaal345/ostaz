import { describe, expect, it } from "vitest";
import { calculateContextReport } from "../shared/contextReport";

describe("calculateContextReport", () => {
  it("يعزل بيانات السنتر ولا يخلطها بالمدرسة أو الأونلاين", () => {
    const report = calculateContextReport({
      contextId: "center",
      groups: [{ id: 1, name: "سنتر أ", place: "سنتر", fee: 200 }, { id: 2, name: "مدرسة أ", place: "مدرسة", fee: 100 }, { id: 3, name: "أونلاين أ", place: "أونلاين", fee: 150 }],
      students: [{ id: 11, group: "سنتر أ", paidAmount: 120 }, { id: 12, group: "سنتر أ", paidAmount: 200 }, { id: 13, group: "مدرسة أ", paidAmount: 100 }],
      attendanceRows: [{ studentId: 11, status: "present" }, { studentId: 12, status: "late" }, { studentId: 13, status: "absent" }],
    });
    expect(report.scopeGroups).toHaveLength(1);
    expect(report.scopeStudents).toHaveLength(2);
    expect(report.attendanceRate).toBe(100);
    expect(report.expected).toBe(400);
    expect(report.collected).toBe(320);
    expect(report.remaining).toBe(80);
  });
});
