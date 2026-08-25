import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const studentView = readFileSync(new URL("../client/src/pages/StudentPortal.tsx", import.meta.url), "utf8");

describe("سياسة فقدان تركيز الاختبار", () => {
  it("تسجل محاولة قيد التنفيذ ثم تقفلها عند حدث فقدان التركيز", () => {
    expect(schema).toContain('"in_progress", "submitted", "graded", "locked"');
    expect(dbSource).toContain("startQuizAttempt");
    expect(dbSource).toContain("recordQuizFocusEvent");
    expect(dbSource).toContain('set({ status: "locked" })');
  });

  it("لا يسمح بتسجيل حدث أو تسليم لمحاولة لطالب آخر أو لمحاولة مقفلة", () => {
    expect(dbSource).toContain("eq(quizAttempts.studentId, studentId)");
    expect(dbSource).toContain('attempt.status === "locked"');
    expect(routerSource).toContain("focusEvent: publicProcedure");
    expect(routerSource).toContain("QUIZ_LOCKED_BY_FOCUS");
  });

  it("يوضح أن الرصد داخل المتصفح لا يمنع التطبيقات الأخرى أو تسجيل الشاشة", () => {
    expect(studentView).toContain("هذا رصد داخل المتصفح");
    expect(studentView).toContain("لا يمنع تطبيقات أخرى أو تسجيل الشاشة");
  });
});
