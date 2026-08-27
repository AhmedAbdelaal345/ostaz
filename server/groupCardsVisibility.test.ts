import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const profileSource = readFileSync(
  new URL("../client/src/pages/EntityProfile.tsx", import.meta.url),
  "utf8"
);

describe("ظهور كروت طلاب المجموعة", () => {
  it("يعرض الكروت مباشرة عند فتح المزيد في بطاقة المجموعة", () => {
    expect(appSource).toContain("function GroupInlineStudentCards");
    expect(appSource).toContain("trpc.app.groups.detail.useQuery");
    expect(appSource).toContain("<GroupInlineStudentCards groupId={g.id} />");
  });

  it("لا يعطل معالج منع النسخ النقرات عندما لا يكون هدف الحدث عنصرًا", () => {
    expect(appSource).toContain("if (!(target instanceof Element)) return false");
  });

  it("يعيد استخدام كروت المتابعة نفسها في البروفايل وتوسعة المجموعة", () => {
    expect(profileSource).toContain("export function GroupQuickAttendance");
    expect(profileSource).toContain("student-daily-card");
    expect(profileSource).toContain("dailyFollowUps.save");
  });
});
