import type { Request, Response } from "express";
import { claimPersonalReminderDelivery, getAutomationScheduleByTaskUid, listDuePersonalReminders } from "./db";
import { isPushConfigured, sendPushToUser } from "./push";
import { sdk } from "./_core/sdk";

export async function runScheduledPersonalReminders(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const schedule = await getAutomationScheduleByTaskUid(user.taskUid);
    if (!schedule || schedule.kind !== "personal-reminders" || !schedule.enabled) return res.json({ ok: true, skipped: "orphan" });
    if (!isPushConfigured()) return res.json({ ok: true, skipped: "push-not-configured" });
    const due = await listDuePersonalReminders();
    let claimed = 0; let delivered = 0;
    for (const reminder of due) {
      try {
        const claimedReminder = await claimPersonalReminderDelivery(reminder.id);
        if (!claimedReminder) continue;
        claimed += 1;
        const outcome = await sendPushToUser(claimedReminder.userId, { title: "ذكّرني", body: claimedReminder.note ? `${claimedReminder.title} — ${claimedReminder.note}` : claimedReminder.title, url: "/settings/reminders" });
        delivered += outcome.delivered;
      } catch (error) {
        console.warn("[PersonalReminder] skipped reminder", reminder.id, error instanceof Error ? error.message : error);
      }
    }
    return res.json({ ok: true, scanned: due.length, claimed, delivered, timestamp: new Date().toISOString() });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return res.status(500).json({ error: err.message, stack: err.stack, context: { url: req.originalUrl }, timestamp: new Date().toISOString() });
  }
}
