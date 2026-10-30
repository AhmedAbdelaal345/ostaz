import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getNextReminderDate, shouldDeliverPersonalReminder } from "../shared/personalReminder";

describe("personal reminder recurrence", () => {
  it("advances daily and weekly reminders without changing the time", () => {
    const start = new Date("2026-08-24T09:30:00.000Z");
    expect(getNextReminderDate(start, "daily")?.toISOString()).toBe("2026-08-25T09:30:00.000Z");
    expect(getNextReminderDate(start, "weekly")?.toISOString()).toBe("2026-08-31T09:30:00.000Z");
  });

  it("does not schedule another occurrence for one-off reminders", () => {
    expect(getNextReminderDate(new Date("2026-08-24T09:30:00.000Z"), "once")).toBeNull();
  });

  it("keeps a delivered one-off reminder visible without sending it again before manual completion", () => {
    expect(shouldDeliverPersonalReminder("once", null)).toBe(true);
    expect(shouldDeliverPersonalReminder("once", new Date("2026-08-24T09:30:00.000Z"))).toBe(false);
    expect(shouldDeliverPersonalReminder("daily", new Date("2026-08-24T09:30:00.000Z"))).toBe(true);
  });

  it("uses the explicit local-time parser for the mobile datetime field", () => {
    const view = readFileSync(new URL("../client/src/components/PersonalRemindersPanel.tsx", import.meta.url), "utf8");
    expect(view).toContain("parseLocalReminderDateTime(remindAt)");
    expect(view).not.toContain("const date = new Date(remindAt)");
  });

  it("claims recurring deliveries atomically and releases failed sends for retry", () => {
    const database = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const scheduled = readFileSync(resolve(process.cwd(), "server/scheduledPersonalReminders.ts"), "utf8");
    expect(database).toContain("previousDeliveryCondition");
    expect(database).toContain("affectedRows");
    expect(scheduled).toContain("releasePersonalReminderDelivery");
    expect(scheduled.indexOf("const claimedReminder = await claimPersonalReminderDelivery"))
      .toBeLessThan(scheduled.indexOf("const outcome = await sendPushToUser"));
  });

  it("reconciles the existing Heartbeat callbacks on a one-minute schedule", () => {
    const scheduler = readFileSync(resolve(process.cwd(), "server/reminderHeartbeat.ts"), "utf8");
    expect(scheduler).toContain('kind: "personal-reminders"');
    expect(scheduler).toContain('kind: "lesson-reminders"');
    expect(scheduler).toContain('cron: "0 * * * * *"');
    expect(scheduler).toContain("ensureReminderHeartbeatJobs");
  });
});
