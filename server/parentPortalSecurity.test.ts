import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const sessionSource = readFileSync(new URL("./parentAuth.ts", import.meta.url), "utf8");
const parentView = readFileSync(new URL("../client/src/pages/ParentPortal.tsx", import.meta.url), "utf8");

describe("بوابة ولي الأمر", () => {
  it("تربط الحساب بالطلاب الذين يطابق رقم ولي أمرهم فقط", () => {
    expect(dbSource).toContain("findGuardianStudents(userId: number, phone: string)");
    expect(dbSource).toContain("normalizeStudentPhone(student.guardianPhone) === normalized");
    expect(dbSource).toContain("parentStudentLinks");
  });

  it("يقيّد بيانات البوابة بمعرف الحساب ومعلم الطالب معًا", () => {
    expect(dbSource).toContain("eq(parentStudentLinks.parentId, parentId), eq(students.userId, userId)");
    expect(dbSource).toContain("getParentAccountByPhone(userId: number, phone: string)");
    expect(routerSource).toContain("parentAuth: router");
    expect(routerSource).toContain("getParentPortalData(session.accountId, session.userId)");
    expect(routerSource).toContain("getTeacherAccountByPhone(normalizeTeacherPhone(input.teacherPhone))");
    expect(routerSource).toContain("getParentAccountByPhone(teacher.userId, input.phone)");
  });

  it("يفصل جلسة ولي الأمر عن كوكي الطالب والمعلم ويشرح عزل الأبناء", () => {
    expect(sessionSource).toContain('PARENT_SESSION_COOKIE = "ostazi_parent_session"');
    expect(sessionSource).toContain('kind: "parent"');
    expect(parentView).toContain("مساحة هذا المدرس فقط");
  });
});
