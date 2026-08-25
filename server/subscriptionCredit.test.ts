import { describe, expect, it } from "vitest";
import { selectApplicableCredits } from "../shared/subscriptionCredit";

describe("subscription credit selection", () => {
  it("applies only credits that fit the unpaid balance", () => {
    expect(selectApplicableCredits([20, 15, 30], 40)).toEqual({ selectedIndexes: [0, 1], applied: 35 });
  });

  it("does not apply a credit that exceeds the available balance", () => {
    expect(selectApplicableCredits([50, 10], 25)).toEqual({ selectedIndexes: [1], applied: 10 });
  });
});
