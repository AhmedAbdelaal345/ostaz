export const YEAR_WORK_FIELDS = [
  { key: "homeWork", label: "الأداء المنزلي" },
  { key: "activity", label: "النشاط" },
  { key: "weeklyEvaluation", label: "التقييم الأسبوعي" },
  { key: "performanceTasks", label: "المهام الأدائية" },
  { key: "behavior", label: "السلوك" },
  { key: "attendance", label: "المواظبة" },
] as const;

export type YearWorkField = typeof YEAR_WORK_FIELDS[number]["key"];
export type YearWorkMarks = Record<YearWorkField, number> & { monthlyExam?: number };
export type AttendanceLike = { studentId: number; lessonDate: Date | string; status: "present" | "late" | "absent" };

export const clampYearWorkMark = (value: number) => Math.min(5, Math.max(0, Number.isFinite(value) ? Math.round(value) : 0));
export const calculateYearWorkMonthTotal = (marks: Partial<YearWorkMarks>) => YEAR_WORK_FIELDS.reduce((total, field) => total + clampYearWorkMark(Number(marks[field.key] ?? 0)), 0);

const isoDate = (value: Date | string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const dateFor = (key: string) => new Date(`${key}T12:00:00`);
const defaultSchoolDays = [0, 1, 2, 3, 4];

export function isAbsentEverySchoolDay(attendanceRows: AttendanceLike[], studentId: number, start: Date, end: Date, schoolDays = defaultSchoolDays) {
  const requiredDates: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(12, 0, 0, 0);
  const last = new Date(end);
  last.setHours(12, 0, 0, 0);
  while (cursor <= last) {
    if (schoolDays.includes(cursor.getDay())) requiredDates.push(isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return requiredDates.length > 0 && requiredDates.every(day => attendanceRows.some(row => row.studentId === studentId && row.status === "absent" && isoDate(row.lessonDate) === day));
}

export function hasFullyAbsentWeek(attendanceRows: AttendanceLike[], studentId: number, monthKey: string, schoolDays = defaultSchoolDays) {
  const monthStart = dateFor(`${monthKey}-01`);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 12);
  const cursor = new Date(monthStart);
  while (cursor <= monthEnd) {
    const weekStart = new Date(cursor);
    weekStart.setDate(cursor.getDate() - cursor.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const start = weekStart < monthStart ? monthStart : weekStart;
    const end = weekEnd > monthEnd ? monthEnd : weekEnd;
    if (isAbsentEverySchoolDay(attendanceRows, studentId, start, end, schoolDays)) return true;
    cursor.setDate(cursor.getDate() + 7);
  }
  return false;
}

export function calculateEffectiveYearWorkMonth(marks: Partial<YearWorkMarks>, attendanceRows: AttendanceLike[], studentId: number, monthKey: string) {
  const monthStart = dateFor(`${monthKey}-01`);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 12);
  if (isAbsentEverySchoolDay(attendanceRows, studentId, monthStart, monthEnd)) return { total: 0, automaticZero: "غائب طوال الشهر" as const };
  if (hasFullyAbsentWeek(attendanceRows, studentId, monthKey)) return { total: 0, automaticZero: "غائب طوال أسبوع" as const };
  return { total: calculateYearWorkMonthTotal(marks), automaticZero: null };
}

export function calculateYearWorkTermAverage(monthTotals: number[]) {
  if (!monthTotals.length) return 0;
  return Math.round((monthTotals.reduce((total, value) => total + Math.min(30, Math.max(0, value)), 0) / monthTotals.length) * 100) / 100;
}
