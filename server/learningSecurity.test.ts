import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("عزل صلاحيات مركز التعلم", () => {
  it("يربط قراءة ومراجعة تسليم الواجب بمعلم الطالب وملكية التسليم", () => {
    expect(dbSource).toContain("eq(assignmentSubmissions.userId, userId)");
    expect(dbSource).toContain("eq(students.userId, userId)");
    expect(dbSource).toContain("eq(assignmentSubmissions.id, id), eq(assignmentSubmissions.userId, userId)");
  });

  it("لا يقبل تسليم الطالب إلا بعد استعادة جلسته والتحقق من مجموعته", () => {
    expect(routerSource).toContain("assignments: router");
    expect(routerSource).toContain("const session = await getStudentSession(ctx.req)");
    expect(routerSource).toContain("const access = await getStudentGroupAccess(session.studentId)");
    expect(routerSource).toContain("return persistAssignmentImage(access.userId, session.studentId, input)");
  });

  it("يقصر رسالة الطالب على مجموعته بدل استلام رقم مجموعة من العميل", () => {
    expect(routerSource).toContain("studentPost: publicProcedure.input(z.object({ body:");
    expect(routerSource).toContain("return postStudentDiscussionMessage(session.studentId, input.body)");
    expect(dbSource).toContain("const access = await getStudentGroupAccess(studentId)");
  });
});
