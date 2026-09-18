export const WEEK_DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];
export type ScheduleEntry = { day: string; time: string };

export function parseSchedule(value: string | null | undefined, fallbackDay: string, fallbackTime: string): ScheduleEntry[] {
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every(item => item && typeof item.day === "string" && typeof item.time === "string")) return parsed;
    } catch {
      // Legacy rows fall back to their original day/time columns.
    }
  }
  return [{ day: fallbackDay, time: fallbackTime }];
}

export function scheduleForGroup(group: { schedule?: ScheduleEntry[]; scheduleJson?: string | null; day: string; time: string }): ScheduleEntry[] {
  // `scheduleJson` is the persisted source of truth. A local optimistic row
  // can still carry an older `schedule` array after an edit, so preferring the
  // array here makes cards/widgets show stale times until a full reload.
  if (group.scheduleJson !== null && group.scheduleJson !== undefined) {
    return parseSchedule(group.scheduleJson, group.day, group.time);
  }
  return group.schedule?.length ? group.schedule : parseSchedule(null, group.day, group.time);
}

export function serializeSchedule(entries: ScheduleEntry[]) {
  return JSON.stringify(entries.filter(entry => entry.day && entry.time));
}

export function countScheduledLessons(groups: Array<{ schedule?: ScheduleEntry[]; scheduleJson?: string | null; day: string; time: string }>) {
  return groups.reduce((total, group) => total + scheduleForGroup(group).length, 0);
}
