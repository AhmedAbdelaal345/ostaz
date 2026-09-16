import { describe, expect, it } from "vitest";
import { getLessonEndingReminder } from "../shared/lessonReminder";
import { defaultSchoolSettings } from "../shared/schoolDay";

describe("تذكير نهاية الحصة والفسحة", () => {
  const settings = { ...defaultSchoolSettings, configured: true, days: ["الأحد"], firstLessonStart: "08:00", assemblyStart: "07:30", lessonMinutes: 45, lessonCount: 3, breakAfterLesson: 1, breakStart: "08:45", breakMinutes: 20, schoolEnd: "11:00", schedule: { "الأحد": [{ period: 1, subject: "رياضيات", classroom: "1/أ" }, { period: 2, subject: "علوم", classroom: "1/أ" }, { period: 3, subject: "لغة عربية", classroom: "1/أ" }] } };

  it("يرسل تذكيرًا ضمن آخر خمس دقائق للحصة فقط", () => {
    const result = getLessonEndingReminder(settings, new Date("2026-08-23T08:42:00"));
    expect(result?.body).toContain("رياضيات");
    expect(getLessonEndingReminder(settings, new Date("2026-08-23T08:35:00"))).toBeNull();
  });

  it("يرسل إشعار بداية الفسحة خلال نافذة الدقيقتين بعد بدايتها", () => {
    const result = getLessonEndingReminder(settings, new Date("2026-08-23T08:46:00"));
    expect(result?.title).toContain("بدأت الفسحة");
    expect(result?.body).toContain("20 دقيقة");
    expect(getLessonEndingReminder(settings, new Date("2026-08-23T08:48:01"))).toBeNull();
  });
});
