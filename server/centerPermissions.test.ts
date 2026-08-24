import { describe, expect, it } from "vitest";
import { canCenterAction, type CenterScope } from "./db";

const center = { id: 1, ownerUserId: 1, name: "مركز", phone: null, address: null, createdAt: new Date(), updatedAt: new Date() };

describe("صلاحيات فريق المركز", () => {
  it("يسمح للمالك والمدرس بالإدارة ويقصر المساعد على الصلاحيات الممنوحة", () => {
    const owner: CenterScope = { dataUserId: 1, role: "owner", permissions: ["attendance", "finance"], center };
    const assistant: CenterScope = { dataUserId: 1, role: "assistant", permissions: ["attendance"], center };
    expect(canCenterAction(owner, "manage")).toBe(true);
    expect(canCenterAction(assistant, "attendance")).toBe(true);
    expect(canCenterAction(assistant, "finance")).toBe(false);
    expect(canCenterAction(assistant, "manage")).toBe(false);
  });
});
