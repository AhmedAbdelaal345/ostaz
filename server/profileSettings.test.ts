import { describe, expect, it } from "vitest";
import { mergeTeacherProfile } from "../shared/profileSettings";

describe("teacher profile settings", () => {
  it("preserves display mode when another setting is saved", () => {
    const current = { name: "أحمد", displayMode: "عادي" as const, paymentWallet: "0100" };
    const next = mergeTeacherProfile(current, { messageTemplate: "رسالة جديدة" });
    expect(next.displayMode).toBe("عادي");
    expect(next.paymentWallet).toBe("0100");
    expect(next.messageTemplate).toBe("رسالة جديدة");
  });
});
