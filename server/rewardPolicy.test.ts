import { describe, expect, it } from "vitest";
import { rewardCatalog, rewardPointsCost } from "../shared/rewardPolicy";

describe("reward policy", () => {
  it("uses a fixed positive points cost for every reward", () => {
    for (const type of Object.keys(rewardCatalog) as Array<keyof typeof rewardCatalog>) expect(rewardPointsCost(type)).toBeGreaterThan(0);
  });
});
