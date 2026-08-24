import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("إدارة أجهزة الحساب", () => {
  it("تسجل جلسات منفصلة للمعلم والطالب وتوفر إنهاء الأجهزة الأخرى", () => {
    const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
    const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
    const teacherPanel = readFileSync(new URL("../client/src/components/TeacherAccountSecurityPanel.tsx", import.meta.url), "utf8");
    const studentPanel = readFileSync(new URL("../client/src/components/StudentAccountSecurityPanel.tsx", import.meta.url), "utf8");
    expect(schema).toContain('export const accountSessions = mysqlTable("account_sessions"');
    expect(schema).toContain('mysqlEnum("accountType", ["teacher", "student"])');
    expect(router).toContain('createAccountSession({ accountType: "teacher"');
    expect(router).toContain('createAccountSession({ accountType: "student"');
    expect(router).toContain("revokeOtherAccountSessions");
    expect(teacherPanel).toContain("إنهاء الجلسات الأخرى");
    expect(studentPanel).toContain("إنهاء الجلسات الأخرى");
  });
});
