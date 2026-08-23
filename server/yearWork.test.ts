import { describe, expect, it } from "vitest";
import { calculateEffectiveYearWorkMonth, calculateYearWorkMonthTotal, calculateYearWorkTermAverage } from "../shared/yearWork";

const completeMarks = { homeWork: 5, activity: 5, weeklyEvaluation: 5, performanceTasks: 5, behavior: 5, attendance: 5, monthlyExam: 80 };

describe("مساعد أعمال السنة", () => {
  it("يجمع بنود أعمال السنة الستة إلى 30 فقط ويحافظ على الاختبار الشهري مستقلًا", () => {
    expect(calculateYearWorkMonthTotal(completeMarks)).toBe(30);
    expect(calculateYearWorkMonthTotal({ ...completeMarks, homeWork: 9 })).toBe(30);
  });

  it("يصفر مجموع الشهر تلقائيًا عند تسجيل غياب الطالب طوال أسبوع دراسي", () => {
    const attendance = ["2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06"].map(day => ({ studentId: 41, lessonDate: new Date(`${day}T12:00:00`), status: "absent" as const }));
    expect(calculateEffectiveYearWorkMonth(completeMarks, attendance, 41, "2026-08")).toEqual({ total: 0, automaticZero: "غائب طوال أسبوع" });
  });

  it("يحسب متوسط نهاية الترم من إجماليات الشهور على 30", () => {
    expect(calculateYearWorkTermAverage([30, 24, 18])).toBe(24);
    expect(calculateYearWorkTermAverage([])).toBe(0);
  });
});
