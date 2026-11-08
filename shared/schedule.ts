export const WEEK_DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];
export type ScheduleEntry = { day: string; time: string };

/**
 * Normalizes Arabic day names to match WEEK_DAYS standard spelling regardless of hamza variations
 * (e.g. "الاثنين" vs "الإثنين").
 */
export function normalizeArabicDayName(day: string): string {
  const trimmed = day.trim();
  if (trimmed === "الاثنين" || trimmed === "الإثنين") return "الإثنين";
  if (trimmed === "الأحد" || trimmed === "الاحد") return "الأحد";
  if (trimmed === "الأربعاء" || trimmed === "الاربعاء") return "الأربعاء";
  return trimmed;
}

export function parseSchedule(value: string | null | undefined, fallbackDay: string, fallbackTime: string): ScheduleEntry[] {
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every(item => item && typeof item.day === "string" && typeof item.time === "string")) {
        return parsed.map(entry => ({ ...entry, day: normalizeArabicDayName(entry.day) }));
      }
    } catch {
      // Legacy rows fall back to their original day/time columns.
    }
  }
  return [{ day: normalizeArabicDayName(fallbackDay), time: fallbackTime }];
}

export function scheduleForGroup(group: { schedule?: ScheduleEntry[]; scheduleJson?: string | null; day: string; time: string }): ScheduleEntry[] {
  // `scheduleJson` is the persisted source of truth. A local optimistic row
  // can still carry an older `schedule` array after an edit, so preferring the
  // array here makes cards/widgets show stale times until a full reload.
  if (group.scheduleJson !== null && group.scheduleJson !== undefined) {
    return parseSchedule(group.scheduleJson, group.day, group.time);
  }
  return group.schedule?.length
    ? group.schedule.map(entry => ({ ...entry, day: normalizeArabicDayName(entry.day) }))
    : parseSchedule(null, group.day, group.time);
}

export function serializeSchedule(entries: ScheduleEntry[]) {
  return JSON.stringify(entries.filter(entry => entry.day && entry.time));
}

export function countScheduledLessons(groups: Array<{ schedule?: ScheduleEntry[]; scheduleJson?: string | null; day: string; time: string }>) {
  return groups.reduce((total, group) => total + scheduleForGroup(group).length, 0);
}
