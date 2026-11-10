import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../drizzle/0021_aberrant_kang.sql", import.meta.url), "utf8");
const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const studentPortal = readFileSync(new URL("../client/src/pages/StudentPortal.tsx", import.meta.url), "utf8");

describe("حساب الطالب متعدد المساحات", () => {
  it("يجعل رقم الطالب فريدًا داخل مساحة المدرس لا على مستوى المنصة كلها", () => {
    expect(schema).toContain('userId: int("userId").notNull()');
    expect(schema).toContain('student_accounts_user_phone_unique');
    expect(schema).toContain('on(table.userId, table.phone)');
    expect(migration).toContain('UPDATE `student_accounts` AS account INNER JOIN `students` AS student');
    expect(migration).toContain('DROP INDEX `student_accounts_phone_unique`');
  });

  it("يبحث عن الطالب والحساب داخل userId المستخرج من حساب المدرس", () => {
    expect(db).toContain('findStudentByPhone(userId: number, phone: string)');
    expect(db).toContain('getStudentAccountByPhone(userId: number, phone: string)');
    expect(db).toContain('eq(studentAccounts.userId, userId)');
    expect(routers).toContain('getTeacherAccountByPhone(normalizeTeacherPhone(input.teacherPhone))');
    expect(routers).toContain('findStudentByPhone(teacher.userId, phone)');
    expect(routers).toContain('getStudentAccountByPhone(teacher.userId, phone)');
  });

  it("يلزم الطالب بمرجع المدرس في التسجيل والدخول بدل التخمين برقم هاتفه فقط", () => {
    expect(routers).toContain('teacherPhone: z.string().min(7).max(32)');
    expect(studentPortal).toContain('رقم المدرس المسجل في المنصة');
    expect(studentPortal).toContain('mutate({ teacherPhone: teacherPhone.trim(), phone: phone.trim(), password })');
  });
});
