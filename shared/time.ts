export type ClockTime = { hour: string; minute: string; period: "ص" | "م" };

export function parseClockTime(value?: string): ClockTime {
  const match = String(value || "07:00 م").match(/(\d{1,2})(?::(\d{1,2}))?\s*(ص|م)?/);
  const hour = String(Math.min(12, Math.max(1, Number(match?.[1] || 7)))).padStart(2, "0");
  const minute = String(Math.min(59, Math.max(0, Number(match?.[2] || 0)))).padStart(2, "0");
  return { hour, minute, period: match?.[3] === "ص" ? "ص" : "م" };
}

export function clockTimeToMinutes(time: ClockTime) {
  const hour = Number(time.hour) % 12 + (time.period === "م" ? 12 : 0);
  return hour * 60 + Number(time.minute || 0);
}

export function formatClockTime(time: ClockTime, language: "ar" | "en" = "ar") {
  const period = language === "en" ? (time.period === "ص" ? "AM" : "PM") : time.period;
  const minute = String(Math.min(59, Math.max(0, Number(time.minute) || 0))).padStart(2, "0");
  return `${String(Math.min(12, Math.max(1, Number(time.hour) || 7))).padStart(2, "0")}:${minute} ${period}`;
}
