import { describe, expect, it } from "vitest";
import { getLessonEndingReminder } from "../shared/lessonReminder";
import { defaultSchoolSettings } from "../shared/schoolDay";

describe("تذكير نهاية الحصة", () => {
  const settings = { ...defaultSchoolSettings, configured: true, days: ["الأحد"], firstLessonStart: "08:00", assemblyStart: "07:30", lessonMinutes: 45, lessonCount: 1, breakStart: "12:00", schoolEnd: "09:00", schedule: { "الأحد": [{ period: 1, subject: "رياضيات", classroom: "1/أ" }] } };
  it("يرسل تذكيرًا ضمن آخر خمس دقائق للحصة فقط", () => {
    const result = getLessonEndingReminder(settings, new Date("2026-08-23T08:42:00"));
    expect(result?.body).toContain("رياضيات");
    expect(getLessonEndingReminder(settings, new Date("2026-08-23T08:35:00"))).toBeNull();
  });
});
