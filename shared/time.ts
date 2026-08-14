export type ClockTime = { hour: string; period: "ص" | "م" };

export function parseClockTime(value?: string): ClockTime {
  const match = String(value || "07:00 م").match(/(\d{1,2})(?::\d{2})?\s*(ص|م)?/);
  const hour = String(Math.min(12, Math.max(1, Number(match?.[1] || 7)))).padStart(2, "0");
  return { hour, period: match?.[2] === "ص" ? "ص" : "م" };
}

export function formatClockTime(time: ClockTime) {
  return `${String(Math.min(12, Math.max(1, Number(time.hour) || 7))).padStart(2, "0")}:00 ${time.period}`;
}
