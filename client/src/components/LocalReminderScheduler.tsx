import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { showAppNotification } from "@/lib/browserNotifications";
import { useLocalNotificationPreference } from "@/lib/localNotificationPreference";
import { useLanguage } from "@/contexts/LanguageContext";
import { getNextReminderDate } from "../../../shared/personalReminder";

function nextOccurrenceAfter(current: Date, recurrence: "once" | "daily" | "weekly", now: number) {
  let next = getNextReminderDate(current, recurrence);
  let advances = 0;
  while (next && next.getTime() <= now && advances < 370) {
    next = getNextReminderDate(next, recurrence);
    advances += 1;
  }
  return next;
}

export function LocalReminderScheduler() {
  const [enabled] = useLocalNotificationPreference();
  const { language } = useLanguage();
  const reminders = trpc.app.personalReminders.list.useQuery(undefined, {
    retry: false,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!enabled || !reminders.data || !("Notification" in window) || Notification.permission !== "granted") return;

    const timers: number[] = [];
    const scheduleOccurrence = (
      reminder: NonNullable<typeof reminders.data>[number],
      occurrence: Date,
    ) => {
      const occurrenceKey = occurrence.toISOString();
      const markerKey = `el-mister-local-reminder-${reminder.id}`;
      const lastDeliveredAt = reminder.lastDeliveredAt ? new Date(reminder.lastDeliveredAt).getTime() : 0;
      let alreadyMarked = false;
      try {
        alreadyMarked = localStorage.getItem(markerKey) === occurrenceKey;
      } catch {
        // Storage may be blocked; the server delivery timestamp still prevents duplicates.
      }
      if (reminder.recurrence === "once" && (lastDeliveredAt >= occurrence.getTime() || alreadyMarked)) return;
      if (reminder.recurrence !== "once" && lastDeliveredAt >= occurrence.getTime()) {
        const next = nextOccurrenceAfter(occurrence, reminder.recurrence, Date.now());
        if (next) scheduleOccurrence(reminder, next);
        return;
      }

      const delay = Math.min(Math.max(occurrence.getTime() - Date.now(), 0), 2_147_000_000);
      const timer = window.setTimeout(() => {
        if (!enabled || Notification.permission !== "granted") return;
        // setTimeout has a platform maximum; reschedule far-future reminders instead
        // of delivering them early when that maximum expires.
        if (occurrence.getTime() > Date.now()) {
          scheduleOccurrence(reminder, occurrence);
          return;
        }
        try {
          if (localStorage.getItem(markerKey) === occurrenceKey) return;
          // Claim this occurrence synchronously so multiple open tabs do not display it twice.
          localStorage.setItem(markerKey, occurrenceKey);
        } catch {
          // Notification delivery remains available if the browser blocks local storage.
        }
        void showAppNotification({
          title: language === "ar" ? "تذكير" : "Reminder",
          body: reminder.note ? `${reminder.title} — ${reminder.note}` : reminder.title,
          tag: `personal-reminder-${reminder.id}`,
          url: "/settings/reminders",
          language,
        }).catch(error => {
          try {
            if (localStorage.getItem(markerKey) === occurrenceKey) localStorage.removeItem(markerKey);
          } catch {
            // The failed display is retried after the reminder list refreshes.
          }
          console.warn("[Notifications] Could not display a local reminder.", error instanceof Error ? error.message : "unknown error");
        });

        if (reminder.recurrence !== "once") {
          const next = nextOccurrenceAfter(occurrence, reminder.recurrence, Date.now());
          if (next) scheduleOccurrence(reminder, next);
        }
      }, delay);
      timers.push(timer);
    };

    for (const reminder of reminders.data) {
      if (reminder.completed) continue;
      const firstOccurrence = new Date(reminder.remindAt);
      if (!Number.isFinite(firstOccurrence.getTime())) continue;
      if (reminder.recurrence !== "once" && firstOccurrence.getTime() < Date.now()) {
        const deliveredAt = reminder.lastDeliveredAt ? new Date(reminder.lastDeliveredAt).getTime() : 0;
        const start = deliveredAt >= firstOccurrence.getTime()
          ? getNextReminderDate(firstOccurrence, reminder.recurrence)
          : firstOccurrence;
        if (start) scheduleOccurrence(reminder, start);
      } else {
        scheduleOccurrence(reminder, firstOccurrence);
      }
    }

    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [enabled, language, reminders.data]);

  return null;
}
