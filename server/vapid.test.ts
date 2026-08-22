import { describe, expect, it } from "vitest";
import webpush from "web-push";

describe("VAPID configuration", () => {
  it("accepts the configured keys when preparing the Push delivery client", () => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    expect(publicKey).toMatch(/^[A-Za-z0-9_-]{80,}$/);
    expect(privateKey).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(subject).toMatch(/^mailto:/);
    expect(() => webpush.setVapidDetails(subject!, publicKey!, privateKey!)).not.toThrow();
  });
});
