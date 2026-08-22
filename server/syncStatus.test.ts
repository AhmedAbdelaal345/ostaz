import { describe, expect, it } from "vitest";
import { getSyncStatus, syncStatusLabel } from "../shared/syncStatus";

describe("حالة المزامنة", () => {
  it("يعطي رمزًا مستقلًا لكل من الاتصال والمزامنة وعدم الاتصال", () => {
    expect(getSyncStatus(true, 0, false)).toBe("online");
    expect(getSyncStatus(true, 2, false)).toBe("syncing");
    expect(getSyncStatus(false, 2, false)).toBe("offline");
    expect(syncStatusLabel("offline", 2)).toContain("2 تعديل");
  });
});
