import { describe, expect, it } from "vitest";
import { buildSchoolTimeline, defaultSchoolSettings, formatSchoolCountdown, getSchoolDaySnapshot } from "../shared/schoolDay";

describe("اليوم المدرسي", () => {
  const settings = { ...defaultSchoolSettings, assemblyStart: "07:00", firstLessonStart: "07:30", breakStart: "08:50", schoolEnd: "11:30", lessonMinutes: 40, lessonCount: 4, breakAfterLesson: 2, breakMinutes: 20, schedule: { "الأحد": [{ period: 3, subject: "فترة نشاط", classroom: "الملعب", kind: "period" as const }] } };
  const sunday = new Date(2026, 0, 4, 8, 15, 0);
  it("يبني الطابور والحصص والفسحة بالترتيب", () => {
    expect(buildSchoolTimeline(settings, sunday).map(row => row.kind)).toEqual(["assembly", "lesson", "lesson", "break", "period", "lesson"]);
  });
  it("يحسب المتبقي للفسحة ونهاية اليوم", () => {
    const snapshot = getSchoolDaySnapshot(settings, sunday);
    expect(snapshot.current?.title).toBe("الحصة 2");
    expect(snapshot.untilBreak).toBe(2100);
    expect(snapshot.untilEnd).toBeGreaterThan(snapshot.untilBreak || 0);
    expect(formatSchoolCountdown(3600)).toBe("1 ساعة");
  });
  it("يمد الفترة إلى ضعف مدة الحصة", () => {
    const period = buildSchoolTimeline(settings, sunday).find(row => row.kind === "period");
    expect(period && (period.end.getTime() - period.start.getTime()) / 60_000).toBe(80);
  });
});
