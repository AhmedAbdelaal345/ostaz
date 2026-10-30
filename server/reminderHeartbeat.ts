import { createHeartbeatJob, listHeartbeatJobs, updateHeartbeatJob } from "./_core/heartbeat";
import { getAutomationSchedule, saveAutomationSchedule } from "./db";

const REMINDER_JOBS = [
  {
    kind: "personal-reminders",
    name: "Ostazi personal reminders",
    path: "/api/scheduled/personal-reminders",
    description: "Deliver due personal reminders every minute.",
  },
  {
    kind: "lesson-reminders",
    name: "Ostazi lesson reminders",
    path: "/api/scheduled/lesson-reminders",
    description: "Deliver school lesson reminders every minute.",
  },
] as const;

/** Keep the external minute scheduler aligned with the callbacks served by this app. */
export async function ensureReminderHeartbeatJobs() {
  const { jobs } = await listHeartbeatJobs("");

  for (const job of REMINDER_JOBS) {
    const saved = await getAutomationSchedule(job.kind);
    const existing =
      jobs.find(candidate => candidate.taskUid === saved?.scheduleCronTaskUid) ||
      jobs.find(candidate => candidate.name === job.name);

    if (existing) {
      await updateHeartbeatJob(
        existing.taskUid,
        {
          cron: "0 * * * * *",
          path: job.path,
          method: "POST",
          description: job.description,
          enable: true,
        },
        ""
      );
      if (!saved || saved.scheduleCronTaskUid !== existing.taskUid) {
        await saveAutomationSchedule(job.kind, existing.taskUid);
      }
      continue;
    }

    const created = await createHeartbeatJob(
      {
        name: job.name,
        cron: "0 * * * * *",
        path: job.path,
        method: "POST",
        description: job.description,
      },
      ""
    );
    await saveAutomationSchedule(job.kind, created.taskUid);
  }
}
