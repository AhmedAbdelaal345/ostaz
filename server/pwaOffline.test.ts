import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("PWA offline worker", () => {
  it("keeps an app-shell fallback and handles Push notification events", () => {
    const worker = readFileSync(resolve(process.cwd(), "client/public/sw.js"), "utf8");
    expect(worker).toContain("caches.match('/')");
    expect(worker).toContain("self.addEventListener('push'");
    expect(worker).toContain("self.addEventListener('notificationclick'");
    const entry = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    expect(entry).toContain('navigator.serviceWorker.register("/sw.js")');
  });
});
