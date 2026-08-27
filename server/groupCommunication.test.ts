import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("التواصل وتقارير المجموعة", () => {
  it("يوفر بحثًا داخل المجموعة وروابط مستقلة للطالب وولي الأمر وتقارير دورية", () => {
    const view = readFileSync(new URL("../client/src/pages/EntityProfile.tsx", import.meta.url), "utf8");
    expect(view).toContain("GroupCommunicationPanel");
    expect(view).toContain("ابحث بالاسم أو الهاتف أو كود الطالب داخل المجموعة");
    expect(view).toContain("واتساب الطالب");
    expect(view).toContain("ولي الأمر");
    expect(view).toContain("إرسال التقرير لكل الطلاب");
    expect(view).toContain("إرسال التقرير لكل أولياء الأمور");
    expect(view).toContain("formatWeeklyWhatsAppReport");
    expect(view).toContain("أرسل كل رسالة من WhatsApp قبل الانتقال للتالية");
  });
});
