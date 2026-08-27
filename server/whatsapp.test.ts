import { describe, expect, it } from "vitest";
import { formatOutstandingWhatsAppMessage, formatSubscriptionWhatsAppMessage, formatWeeklyWhatsAppReport } from "../shared/whatsapp";

describe("قالب رسالة WhatsApp للمستحقات", () => {
  it("يتضمن اسم الطالب والمجموعة والمبلغ المطلوب", () => {
    const message = formatOutstandingWhatsAppMessage({ studentName: "أحمد محمد", groupName: "ثالثة ثانوي", remainingAmount: 150, collectionPeriod: "term" });
    expect(message).toContain("أحمد محمد");
    expect(message).toContain("ثالثة ثانوي");
    expect(message).toContain("١٥٠");
    expect(message).toContain("رسوم الترم");
  });

  it("يضع قالب الاشتراك البيانات المالية وتاريخ الانضمام", () => {
    const message = formatSubscriptionWhatsAppMessage({ studentName: "سلمى", groupName: "أولى ثانوي", joinedAt: new Date("2026-08-20T12:00:00Z"), paidAmount: 100, remainingAmount: 50 });
    expect(message).toContain("سلمى");
    expect(message).toContain("أولى ثانوي");
    expect(message).toContain("١٠٠");
    expect(message).toContain("٥٠");
  });

  it("يلخص التقرير الأسبوعي الحضور والتقييمات والواجبات والمالية", () => {
    const message = formatWeeklyWhatsAppReport({ studentName: "ياسين", groupName: "أولى ثانوي", present: 2, late: 1, absent: 0, assessments: ["اختبار: 8/10"], homework: ["واجب الدرس: تم التسليم"], paidAmount: 120, remainingAmount: 30 });
    expect(message).toContain("الحضور: 2");
    expect(message).toContain("اختبار: 8/10");
    expect(message).toContain("واجب الدرس: تم التسليم");
    expect(message).toContain("المتبقي");
  });
});
