import { describe, expect, it } from "vitest";
import { shouldConfirmPushDelivery } from "../shared/pushDelivery";

describe("push delivery confirmation", () => {
  it("does not consume a reminder when no subscription accepts the push", () => {
    expect(shouldConfirmPushDelivery({ delivered: 0, subscriptions: 0 })).toBe(false);
    expect(shouldConfirmPushDelivery({ delivered: 0, subscriptions: 1, failed: 1 })).toBe(false);
  });

  it("confirms only after the push provider accepts a subscription", () => {
    expect(shouldConfirmPushDelivery({ delivered: 1, subscriptions: 1 })).toBe(true);
  });
});
