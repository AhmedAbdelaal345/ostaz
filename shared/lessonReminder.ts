import { buildSchoolTimeline, type SchoolSettings } from "./schoolDay";

export type LessonReminder = { key: string; title: string; body: string; url: string } | null;

export function getLessonEndingReminder(settings: SchoolSettings, now = new Date()): LessonReminder {
  if (!settings.configured) return null;
  const item = buildSchoolTimeline(settings, now).find(row => row.kind === "lesson" && now >= row.start && now < row.end);
  if (!item) return null;
  const remainingMs = item.end.getTime() - now.getTime();
  if (remainingMs <= 0 || remainingMs > 5 * 60_000) return null;
  const key = `${now.toISOString().slice(0, 10)}:${item.start.toISOString()}:${item.end.toISOString()}`;
  return { key, title: "أستاذي · تنبيه الحصة", body: `متبقٍ أقل من 5 دقائق على نهاية ${item.title}${item.subtitle ? ` · ${item.subtitle}` : ""}.`, url: "/?context=school" };
}
