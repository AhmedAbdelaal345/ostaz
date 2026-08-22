import { describe, expect, it } from "vitest";
import { formatOutstandingWhatsAppMessage } from "../shared/whatsapp";

describe("قالب رسالة WhatsApp للمستحقات", () => {
  it("يتضمن اسم الطالب والمجموعة والمبلغ المطلوب", () => {
    const message = formatOutstandingWhatsAppMessage({ studentName: "أحمد محمد", groupName: "ثالثة ثانوي", remainingAmount: 150, collectionPeriod: "term" });
    expect(message).toContain("أحمد محمد");
    expect(message).toContain("ثالثة ثانوي");
    expect(message).toContain("١٥٠");
    expect(message).toContain("رسوم الترم");
  });
});
