import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("ملكية العمليات التعليمية والمالية", () => {
  it("يتحقق من الطالب والمجموعة داخل مساحة المدرس قبل أي كتابة عالية الحساسية", () => {
    expect(db).toContain("async function ensureOwnedStudentAndGroup(userId: number, studentId?: number | null, groupId?: number | null)");
    expect(db).toContain("eq(students.id, studentId), eq(students.userId, userId)");
    expect(db).toContain("eq(studyGroups.id, groupId), eq(studyGroups.userId, userId)");
    expect(db).toContain("STUDENT_GROUP_MISMATCH");
  });

  it("يستدعي حارس الملكية قبل الحضور والمالية والتقييم والسلوك", () => {
    const protectedWrites = ["markAttendance", "createTransaction", "createAssessment", "createBehaviorRecord"];
    for (const operation of protectedWrites) {
      const start = db.indexOf(`export async function ${operation}`);
      const excerpt = db.slice(start, start + 420);
      expect(excerpt).toContain("await ensureOwnedStudentAndGroup(userId, input.studentId, input.groupId)");
    }
  });

  it("يحوّل رفض الوصول إلى خطأ صلاحية آمن في مسارات التطبيق", () => {
    expect(routers).toContain("function throwSafeTenantScopeError(error: unknown): never");
    expect(routers).toContain('code: "FORBIDDEN", message: "لا يمكنك استخدام طالب أو مجموعة خارج مساحة حسابك."');
    expect(routers).toContain("return throwSafeTenantScopeError(error)");
  });
});
