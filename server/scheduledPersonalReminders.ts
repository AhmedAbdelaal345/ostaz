import type { Request, Response } from "express";
import { claimPersonalReminderDelivery, getAutomationScheduleByTaskUid, listDuePersonalReminders, releasePersonalReminderDelivery } from "./db";
import { isPushConfigured, sendPushToUser } from "./push";
import { authorizeScheduledRequest } from "./_core/scheduledAuth";
import { shouldConfirmPushDelivery } from "../shared/pushDelivery";

export async function runScheduledPersonalReminders(req: Request, res: Response) {
  try {
    const authorization = await authorizeScheduledRequest(req);
    if (!authorization) return res.status(403).json({ error: "cron-only" });
    if (authorization.taskUid) {
      const schedule = await getAutomationScheduleByTaskUid(authorization.taskUid);
      if (!schedule || schedule.kind !== "personal-reminders" || !schedule.enabled) return res.json({ ok: true, skipped: "orphan" });
    }
    if (!isPushConfigured()) return res.json({ ok: true, skipped: "push-not-configured" });
    const due = await listDuePersonalReminders();
    let claimed = 0; let delivered = 0; let retried = 0;
    for (const reminder of due) {
      const claimedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
      const claimedReminder = await claimPersonalReminderDelivery(reminder.id, claimedAt);
      if (!claimedReminder) continue;
      claimed += 1;
      try {
        const outcome = await sendPushToUser(claimedReminder.userId, { title: "ذكّرني", body: claimedReminder.note ? `${claimedReminder.title} — ${claimedReminder.note}` : claimedReminder.title, url: "/settings/reminders", tag: `personal-reminder-${claimedReminder.id}`, lang: "ar" });
        if (!shouldConfirmPushDelivery(outcome)) {
          if (await releasePersonalReminderDelivery(claimedReminder, claimedAt)) retried += 1;
          continue;
        }
        delivered += outcome.delivered;
      } catch (error) {
        try {
          if (await releasePersonalReminderDelivery(claimedReminder, claimedAt)) retried += 1;
        } catch (releaseError) {
          console.warn("[PersonalReminder] failed to release reminder", claimedReminder.id, releaseError instanceof Error ? releaseError.message : releaseError);
        }
        console.warn("[PersonalReminder] delivery failed", claimedReminder.id, error instanceof Error ? error.message : error);
      }
    }
    return res.json({ ok: true, scanned: due.length, claimed, delivered, retried, timestamp: new Date().toISOString() });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[PersonalReminder] scheduled run failed", err.message);
    return res.status(500).json({ error: "scheduled reminder failed", timestamp: new Date().toISOString() });
  }
}
