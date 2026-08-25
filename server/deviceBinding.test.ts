import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const studentView = readFileSync(new URL("../client/src/components/StudentAccountSecurityPanel.tsx", import.meta.url), "utf8");

describe("ربط متصفح الطالب", () => {
  it("يحفظ معرّف المتصفح بشكل hash ولا يقبل متصفحًا مختلفًا دون فك ارتباط", () => {
    expect(dbSource).toContain("createHash(\"sha256\").update(value).digest(\"hex\")");
    expect(dbSource).toContain("DEVICE_BOUND_TO_ANOTHER_BROWSER");
    expect(dbSource).toContain("DEVICE_RELEASE_REQUESTED");
  });

  it("يحصر تحرير الربط بالمعلم المالك لسجل الطالب", () => {
    expect(dbSource).toContain("eq(students.id, studentId), eq(students.userId, userId)");
    expect(routerSource).toContain("devices: router");
    expect(routerSource).toContain("releaseTeacherStudentDeviceBinding(ctx.user.id, input.studentId)");
  });

  it("يشرح للمستخدم حدود ربط المتصفح وعدم اعتباره قفل جهاز أصليًا", () => {
    expect(studentView).toContain("ليس قفل جهاز أصليًا");
    expect(studentView).toContain("حذف بيانات المتصفح");
    expect(studentView).toContain("requestRelease");
  });
});
