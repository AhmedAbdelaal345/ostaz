import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const main = readFileSync(new URL("../client/src/main.tsx", import.meta.url), "utf8");
const landing = readFileSync(new URL("../client/src/pages/PlatformLanding.tsx", import.meta.url), "utf8");
const teacherAuth = readFileSync(new URL("./teacherAuth.ts", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");

describe("منصة الحسابات المستقلة", () => {
  it("يتيح بوابة المنصة العامة ويُبقي مسارات الحسابات المنفصلة واضحة", () => {
    expect(main).toContain('pathname === "/platform" ? PlatformLanding');
    expect(main).toContain('pathname === "/platform" || pathname.startsWith("/student/")');
    expect(landing).toContain('setLocation("/teacher/register")');
    expect(landing).toContain('setLocation("/student/login")');
    expect(landing).toContain('setLocation("/parent/login")');
  });

  it("يربط جلسة المدرس بحساب ومساحة userId محددين ولا يعتمد على بيانات متصفح العميل", () => {
    expect(teacherAuth).toContain('type TeacherSession = { accountId: number; userId: number; sessionId?: string }');
    expect(teacherAuth).toContain('payload.kind !== "teacher"');
    expect(routers).toContain('createTeacherSession({ accountId: account.id, userId: account.userId, sessionId })');
    expect(routers).toContain('getTeacherSession(ctx.req)');
  });

  it("يمرر نطاق المدرس من الجلسة للإجراءات التعليمية والتجارية بدل قبول userId من العميل", () => {
    expect(routers).toContain('listStoreProducts(ctx.user.id)');
    expect(routers).toContain('listTeacherStoreOrders(ctx.user.id)');
    expect(routers).toContain('createCenterRoom(ctx.user.id, input)');
    expect(db).toContain('userId: context.userId, studentId');
    expect(db).toContain('eq(storeProducts.userId, context.userId)');
  });
});
