export function getReminderDelayMinutes(target: Date, now = new Date()) {
  const milliseconds = target.getTime() - now.getTime();
  if (!Number.isFinite(milliseconds)) return null;
  return Math.ceil(milliseconds / 60_000);
}
