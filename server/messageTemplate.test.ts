import { describe, expect, it } from "vitest";
import { renderMessageTemplate } from "../shared/messageTemplate";

describe("قوالب رسائل التواصل", () => {
  it("يستبدل المتغيرات المعتمدة فقط عند المعاينة", () => {
    expect(renderMessageTemplate("مرحبًا {اسم الطالب} في {المجموعة}؛ المتبقي {المبلغ}", { studentName: "سارة", groupName: "1/أ", date: "2026-08-24", teacherName: "أحمد", amount: 75 })).toBe("مرحبًا سارة في 1/أ؛ المتبقي 75");
  });
});
