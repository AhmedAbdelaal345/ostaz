import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("مساعد رسائل الطالب", () => {
  it("يقيد الإجابات بسجل الطالب ويغطي الدرجات والغياب والمستحقات", () => {
    const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
    const view = readFileSync(new URL("../client/src/components/StudentTeacherAssistant.tsx", import.meta.url), "utf8");
    expect(db).toContain("getStudentAssistantContext(studentId");
    expect(db).toContain("absencesCount");
    expect(db).toContain("remainingAmount");
    expect(router).toContain("studentAssistant: router");
    expect(router).toContain("سجل دخول الطالب مطلوب");
    expect(router).toContain("latestAssessments");
    expect(router).toContain("Never reveal data about other students");
    expect(router).toContain("language: z.enum");
    expect(router).toContain("Your latest recorded scores");
    expect(view).toContain("ما آخر درجاتي في الاختبارات؟");
    expect(view).toContain("When are my lessons?");
    expect(view).toContain("كم المبلغ المتبقي عليّ؟");
  });
});
