import { buildSchoolTimeline, type SchoolSettings } from "./schoolDay";

export type LessonReminder = { key: string; title: string; body: string; url: string } | null;

/**
 * Returns one reminder for the current school event. The scheduler runs every
 * minute, so the break window tolerates a small delivery delay without sending
 * the same event repeatedly; claimLessonReminder makes the key idempotent.
 */
export function getLessonEndingReminder(settings: SchoolSettings, now = new Date()): LessonReminder {
  if (!settings.configured) return null;
  const timeline = buildSchoolTimeline(settings, now);
  const lesson = timeline.find(row => row.kind === "lesson" && now >= row.start && now < row.end);
  if (lesson) {
    const remainingMs = lesson.end.getTime() - now.getTime();
    if (remainingMs > 0 && remainingMs <= 5 * 60_000) {
      const key = `${now.toISOString().slice(0, 10)}:lesson-end:${lesson.start.toISOString()}:${lesson.end.toISOString()}`;
      return { key, title: "أستاذي · تنبيه الحصة", body: `متبقٍ أقل من 5 دقائق على نهاية ${lesson.title}${lesson.subtitle ? ` · ${lesson.subtitle}` : ""}.`, url: "/?context=school" };
    }
  }

  const breakItem = timeline.find(row => row.kind === "break");
  if (breakItem) {
    const sinceStartMs = now.getTime() - breakItem.start.getTime();
    if (sinceStartMs >= 0 && sinceStartMs <= 2 * 60_000) {
      const key = `${now.toISOString().slice(0, 10)}:break-start:${breakItem.start.toISOString()}`;
      return { key, title: "أستاذي · بدأت الفسحة", body: `بدأت الفسحة الآن ومدتها ${breakItem.subtitle}.`, url: "/?context=school" };
    }
  }

  return null;
}
