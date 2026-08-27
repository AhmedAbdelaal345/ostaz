import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { selectApplicableCredits } from "../shared/subscriptionCredit";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");

describe("subscription credit selection", () => {
  it("applies only credits that fit the unpaid balance", () => {
    expect(selectApplicableCredits([20, 15, 30], 40)).toEqual({ selectedIndexes: [0, 1], applied: 35 });
  });

  it("does not apply a credit that exceeds the available balance", () => {
    expect(selectApplicableCredits([50, 10], 25)).toEqual({ selectedIndexes: [1], applied: 10 });
  });

  it("creates a traceable one-time credit and marks it applied when collected", () => {
    expect(dbSource).toContain("rewardRedemptionId: request.id");
    expect(dbSource).toContain('referenceKey: `reward:${request.id}`');
    expect(dbSource).toContain('eq(studentSubscriptionCredits.status, "available")');
    expect(dbSource).toContain('set({ status: "applied", appliedAt: now })');
    expect(dbSource).toContain('kind: "subscription"');
    expect(dbSource).toContain("خصم نقاط ${selection.applied} ج.م");
  });
});
