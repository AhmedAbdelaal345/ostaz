import type { Request, Response } from "express";
import { getAutomationScheduleByTaskUid, claimLessonReminder, listEnabledLessonReminders } from "./db";
import { getLessonEndingReminder } from "../shared/lessonReminder";
import { sendPushToUser } from "./push";
import { sdk } from "./_core/sdk";

export async function runScheduledLessonReminders(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const schedule = await getAutomationScheduleByTaskUid(user.taskUid);
    if (!schedule || schedule.kind !== "lesson-reminders" || !schedule.enabled) return res.json({ ok: true, skipped: "orphan" });
    const rows = await listEnabledLessonReminders();
    let claimed = 0; let delivered = 0;
    for (const row of rows) {
      try {
        const settings = row.profile.schoolScheduleJson ? JSON.parse(row.profile.schoolScheduleJson) : null;
        const reminder = settings ? getLessonEndingReminder(settings) : null;
        if (!reminder || !(await claimLessonReminder(row.reminder.userId, reminder.key))) continue;
        claimed += 1;
        const outcome = await sendPushToUser(row.reminder.userId, reminder);
        delivered += outcome.delivered;
      } catch (error) {
        console.warn("[LessonReminder] skipped user", row.reminder.userId, error instanceof Error ? error.message : error);
      }
    }
    return res.json({ ok: true, scanned: rows.length, claimed, delivered, timestamp: new Date().toISOString() });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return res.status(500).json({ error: err.message, stack: err.stack, context: { url: req.originalUrl }, timestamp: new Date().toISOString() });
  }
}
