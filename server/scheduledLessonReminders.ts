import type { Request, Response } from "express";
import { getAutomationScheduleByTaskUid, claimLessonReminder, releaseLessonReminderClaim, listEnabledLessonReminders } from "./db";
import { getLessonEndingReminder } from "../shared/lessonReminder";
import { sendPushToUser } from "./push";
import { sdk } from "./_core/sdk";
import { shouldConfirmPushDelivery } from "../shared/pushDelivery";

export async function runScheduledLessonReminders(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const schedule = await getAutomationScheduleByTaskUid(user.taskUid);
    if (!schedule || schedule.kind !== "lesson-reminders" || !schedule.enabled) return res.json({ ok: true, skipped: "orphan" });
    const rows = await listEnabledLessonReminders();
    let claimed = 0; let delivered = 0; let retried = 0;
    for (const row of rows) {
      let reminderKey: string | undefined;
      let claimedAt: Date | undefined;
      let previous: Awaited<ReturnType<typeof claimLessonReminder>> = undefined;
      try {
        const settings = row.profile.schoolScheduleJson ? JSON.parse(row.profile.schoolScheduleJson) : null;
        const reminder = settings ? getLessonEndingReminder(settings) : null;
        if (!reminder) continue;
        reminderKey = reminder.key;
        claimedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
        previous = await claimLessonReminder(row.reminder.userId, reminder.key, claimedAt);
        if (!previous) continue;
        claimed += 1;
        const outcome = await sendPushToUser(row.reminder.userId, reminder);
        if (!shouldConfirmPushDelivery(outcome)) {
          if (await releaseLessonReminderClaim(row.reminder.userId, reminder.key, claimedAt, previous)) retried += 1;
          continue;
        }
        delivered += outcome.delivered;
      } catch (error) {
        if (reminderKey && claimedAt && previous) {
          try {
            if (await releaseLessonReminderClaim(row.reminder.userId, reminderKey, claimedAt, previous)) retried += 1;
          } catch (releaseError) {
            console.warn("[LessonReminder] failed to release claim", row.reminder.userId, releaseError instanceof Error ? releaseError.message : releaseError);
          }
        }
        console.warn("[LessonReminder] skipped user", row.reminder.userId, error instanceof Error ? error.message : error);
      }
    }
    return res.json({ ok: true, scanned: rows.length, claimed, delivered, retried, timestamp: new Date().toISOString() });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return res.status(500).json({ error: err.message, stack: err.stack, context: { url: req.originalUrl }, timestamp: new Date().toISOString() });
  }
}
