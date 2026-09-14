export const schoolWeekDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"] as const;
const jsDayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] as const;

export type SchoolLesson = { period: number; subject: string; classroom: string; kind?: "lesson" | "period" };
export type WeeklyEvaluation = { day: string; title: string; classroom: string; time: string };
export type SchoolSettings = { configured?: boolean; timeZone?: string; days: string[]; assemblyStart: string; firstLessonStart: string; breakStart: string; schoolEnd: string; lessonMinutes: number; lessonCount: number; breakAfterLesson: number; breakMinutes: number; schedule: Record<string, SchoolLesson[]> };
export type SchoolTimelineItem = { kind: "assembly" | "lesson" | "period" | "break"; title: string; subtitle: string; start: Date; end: Date; period?: number };

export const defaultSchoolSettings: SchoolSettings = { configured: false, days: [...schoolWeekDays], assemblyStart: "07:15", firstLessonStart: "07:45", breakStart: "10:00", schoolEnd: "13:45", lessonMinutes: 45, lessonCount: 7, breakAfterLesson: 3, breakMinutes: 20, schedule: {} };

const parseTime = (value: string) => { const [hour = "0", minute = "0"] = value.split(":"); return Number(hour) * 60 + Number(minute); };
const localParts = (date: Date, timeZone?: string) => {
  if (!timeZone) return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), dayName: jsDayNames[date.getDay()] };
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" }).formatToParts(date);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const weekdayMap: Record<string, typeof jsDayNames[number]> = { Sunday: "الأحد", Monday: "الإثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت" };
    return { year: Number(values.year), month: Number(values.month), day: Number(values.day), dayName: weekdayMap[values.weekday] || "الأحد" };
  } catch {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), dayName: jsDayNames[date.getDay()] };
  }
};

const atMinute = (base: Date, minute: number, timeZone?: string) => {
  if (!timeZone) { const next = new Date(base); next.setHours(Math.floor(minute / 60), minute % 60, 0, 0); return next; }
  const parts = localParts(base, timeZone);
  const hour = Math.floor(minute / 60);
  const localGuess = Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute % 60, 0, 0);
  const offsetAt = (instant: number) => {
    const rendered = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(instant));
    const values = Object.fromEntries(rendered.map(part => [part.type, part.value]));
    return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second)) - instant;
  };
  const first = localGuess - offsetAt(localGuess);
  const second = localGuess - offsetAt(first);
  return new Date(second);
};

export function buildSchoolTimeline(settings: SchoolSettings, now = new Date()): SchoolTimelineItem[] {
  const parts = localParts(now, settings.timeZone);
  const day = parts.dayName;
  if (!settings.days.includes(day)) return [];
  const assemblyStart = parseTime(settings.assemblyStart);
  const firstLessonStart = parseTime(settings.firstLessonStart);
  const assemblyEnd = Math.max(firstLessonStart, assemblyStart + 1);
  const rows: SchoolTimelineItem[] = [{ kind: "assembly", title: "طابور الصباح", subtitle: "بداية اليوم المدرسي", start: atMinute(now, assemblyStart, settings.timeZone), end: atMinute(now, assemblyEnd, settings.timeZone) }];
  let cursor = firstLessonStart;
  const explicitBreakStart = parseTime(settings.breakStart || "00:00");
  let breakAdded = false;
  const schedule = settings.schedule[day] || [];
  for (let period = 1; period <= settings.lessonCount; period += 1) {
    const planned = schedule.find(item => item.period === period);
    const itemKind = planned?.kind === "period" ? "period" : "lesson";
    const duration = itemKind === "period" ? settings.lessonMinutes * 2 : settings.lessonMinutes;
    const shouldInsertBreak = !breakAdded && period > 1 && explicitBreakStart >= cursor && explicitBreakStart < cursor + duration;
    if (shouldInsertBreak) { rows.push({ kind: "break", title: "الفسحة", subtitle: `${settings.breakMinutes} دقيقة`, start: atMinute(now, explicitBreakStart, settings.timeZone), end: atMinute(now, explicitBreakStart + settings.breakMinutes, settings.timeZone) }); cursor = explicitBreakStart + settings.breakMinutes; breakAdded = true; }
    rows.push({ kind: itemKind, period, title: planned?.subject || (itemKind === "period" ? `فترة ${period}` : `الحصة ${period}`), subtitle: planned?.classroom || "لم يُحدد الفصل بعد", start: atMinute(now, cursor, settings.timeZone), end: atMinute(now, cursor + duration, settings.timeZone) });
    cursor += duration;
    if (!breakAdded && period === settings.breakAfterLesson && period < settings.lessonCount) { const breakStart = explicitBreakStart > cursor ? explicitBreakStart : cursor; rows.push({ kind: "break", title: "الفسحة", subtitle: `${settings.breakMinutes} دقيقة`, start: atMinute(now, breakStart, settings.timeZone), end: atMinute(now, breakStart + settings.breakMinutes, settings.timeZone) }); cursor = breakStart + settings.breakMinutes; breakAdded = true; }
  }
  return rows;
}

export function getSchoolDaySnapshot(settings: SchoolSettings, now = new Date()) {
  const timeline = buildSchoolTimeline(settings, now);
  const current = timeline.find(item => now >= item.start && now < item.end) || null;
  const next = timeline.find(item => item.start > now) || null;
  const firstLesson = timeline.find(item => item.kind === "lesson") || null;
  const nextBreak = timeline.find(item => item.kind === "break" && item.start > now) || null;
  const configuredEnd = settings.schoolEnd ? atMinute(now, parseTime(settings.schoolEnd), settings.timeZone) : null;
  const lastEnd = timeline.length ? timeline[timeline.length - 1]!.end : null;
  const end = configuredEnd && (!lastEnd || configuredEnd > lastEnd) ? configuredEnd : lastEnd;
  return { timeline, current, next, firstLesson, nextBreak, end, untilAssembly: timeline[0] ? Math.max(0, Math.round((timeline[0].start.getTime() - now.getTime()) / 1000)) : null, untilFirstLesson: firstLesson ? Math.max(0, Math.round((firstLesson.start.getTime() - now.getTime()) / 1000)) : null, untilBreak: nextBreak ? Math.max(0, Math.round((nextBreak.start.getTime() - now.getTime()) / 1000)) : null, untilEnd: end ? Math.max(0, Math.round((end.getTime() - now.getTime()) / 1000)) : null };
}

export function formatSchoolCountdown(seconds: number | null) {
  if (seconds === null) return "غير متاح";
  if (seconds <= 0) return "الآن";
  const hours = Math.floor(seconds / 3600); const minutes = Math.ceil((seconds % 3600) / 60);
  return hours ? `${hours} ساعة${minutes ? ` و${minutes} دقيقة` : ""}` : `${Math.max(1, minutes)} دقيقة`;
}
