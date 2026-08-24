export type PersonalReminderRecurrence = "once" | "daily" | "weekly";

export function getNextReminderDate(current: Date, recurrence: PersonalReminderRecurrence) {
  if (recurrence === "daily") return new Date(current.getTime() + 86_400_000);
  if (recurrence === "weekly") return new Date(current.getTime() + 604_800_000);
  return null;
}
