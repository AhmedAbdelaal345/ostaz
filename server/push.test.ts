import { describe, expect, it } from "vitest";
import { getPushPublicKey, isPushConfigured } from "./push";

describe("Push service", () => {
  it("exposes only a configured public VAPID key for browser subscriptions", () => {
    expect(isPushConfigured()).toBe(true);
    expect(getPushPublicKey()).toMatch(/^[A-Za-z0-9_-]{80,}$/);
  });
});
