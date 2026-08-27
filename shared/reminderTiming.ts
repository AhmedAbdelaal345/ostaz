export function getReminderDelayMinutes(target: Date, now = new Date()) {
  const milliseconds = target.getTime() - now.getTime();
  if (!Number.isFinite(milliseconds)) return null;
  return Math.ceil(milliseconds / 60_000);
}

/**
 * datetime-local has no timezone suffix. Build a local Date from its numeric
 * parts so mobile browsers never reinterpret it as UTC during submission.
 */
export function parseLocalReminderDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return new Date(NaN);
  const [, year, month, day, hour, minute] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0, 0);
}
