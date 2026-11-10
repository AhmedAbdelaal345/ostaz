const REMINDER_PATHS = [
  "/api/scheduled/lesson-reminders",
  "/api/scheduled/personal-reminders",
];

const MAX_ATTEMPTS = 3;

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function callReminderEndpoint(path, env) {
  const url = new URL(path, env.APP_BASE_URL);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.CRON_SECRET}`,
          accept: "application/json",
        },
        redirect: "manual",
      });

      if (response.ok) {
        await response.body?.cancel();
        return { path, ok: true, status: response.status };
      }

      await response.body?.cancel();
      if (response.status < 500 && response.status !== 429) {
        return { path, ok: false, status: response.status };
      }
      if (attempt === MAX_ATTEMPTS) {
        return { path, ok: false, status: response.status };
      }
    } catch {
      if (attempt === MAX_ATTEMPTS) return { path, ok: false, status: "network-error" };
    }

    await wait(250 * attempt);
  }

  return { path, ok: false, status: "retry-exhausted" };
}

export default {
  async scheduled(_controller, env) {
    if (!env.APP_BASE_URL || !env.CRON_SECRET) {
      console.error("Reminder scheduler configuration is incomplete");
      return;
    }

    const results = await Promise.all(REMINDER_PATHS.map(path => callReminderEndpoint(path, env)));
    for (const result of results) {
      if (!result.ok) console.error("Reminder endpoint failed", result.path, result.status);
    }
  },
};
