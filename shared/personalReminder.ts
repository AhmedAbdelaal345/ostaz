export type PersonalReminderRecurrence = "once" | "daily" | "weekly";

export function getNextReminderDate(current: Date, recurrence: PersonalReminderRecurrence) {
  if (recurrence === "daily") return new Date(current.getTime() + 86_400_000);
  if (recurrence === "weekly") return new Date(current.getTime() + 604_800_000);
  return null;
}

/** A one-time reminder stays visible after delivery; it should only be delivered once until the user completes it. */
export function shouldDeliverPersonalReminder(recurrence: PersonalReminderRecurrence, lastDeliveredAt: Date | null | undefined) {
  return recurrence !== "once" || !lastDeliveredAt;
}
