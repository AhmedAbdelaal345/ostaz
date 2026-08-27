import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("PWA offline worker", () => {
  it("keeps an app-shell fallback and handles Push notification events", () => {
    const worker = readFileSync(resolve(process.cwd(), "client/public/sw.js"), "utf8");
    expect(worker).toContain('caches.match("/")');
    expect(worker).toContain('self.addEventListener("push"');
    expect(worker).toContain("requireInteraction: true");
    expect(worker).toContain("event.data?.text?.()");
    expect(worker).toContain('self.addEventListener("notificationclick"');
    const entry = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    expect(entry).toContain('navigator.serviceWorker.register("/sw.js", { scope: "/" })');
    expect(entry).toContain("ostazi-service-worker-ready");
    expect(entry).toContain("enqueueTrpcRequest(String(scoped.input), scoped.init)");
    const offlineRuntime = readFileSync(resolve(process.cwd(), "client/src/components/OfflineRuntime.tsx"), "utf8");
    expect(offlineRuntime).toContain("تمت استعادة الاتصال");
    expect(offlineRuntime).toContain("result.sent");
    expect(offlineRuntime).toContain("if (navigator.onLine && offlineQueueSize()) void sync()");
    const reminders = readFileSync(resolve(process.cwd(), "client/src/components/PersonalRemindersPanel.tsx"), "utf8");
    expect(reminders).toContain("new Notification");
    expect(reminders).toContain("personal-reminder-${reminder.id}");
  });
});
