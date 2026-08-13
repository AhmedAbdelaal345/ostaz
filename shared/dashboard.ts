export type DashboardGroup = { day: string; time: string; name: string; place: string; students: number };

function timeToMinutes(value: string) {
  const match = value.match(/(\d{1,2})[:.](\d{2})\s*(ص|م|am|pm)?/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = (match[3] || "").toLowerCase();
  if ((meridiem === "م" || meridiem === "pm") && hour < 12) hour += 12;
  if ((meridiem === "ص" || meridiem === "am") && hour === 12) hour = 0;
  return hour * 60 + minute;
}

export function getNextGroupForDay<T extends DashboardGroup>(groups: T[], day: string) {
  return groups.filter(group => group.day === day).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))[0];
}
