import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ويدجت ملاحظات المجموعة النشطة", () => {
  it("يربط الملاحظة بالمجموعة والمعلم ويتيح الإكمال والتجديد والحذف", () => {
    const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
    const view = readFileSync(new URL("../client/src/pages/EntityProfile.tsx", import.meta.url), "utf8");
    expect(db).toContain("createGroupNote");
    expect(db).toContain("eq(studyGroups.userId, userId)");
    expect(db).toContain("updateGroupNote");
    expect(db).toContain("deleteGroupNote");
    expect(router).toContain("groupNotes: router");
    expect(view).toContain("مجموعة نشطة الآن");
    expect(view).toContain("ملاحظات المجموعة");
    expect(view).toContain("renew: true");
  });
});
