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
    expect(view).toContain("recipients.length} رسالة WhatsApp جاهزة بالتتابع");
    expect(view).toContain("window.setTimeout");
    expect(view).toContain("رسالة الاشتراك");
    expect(view).toContain("التسميع");
  });

  it("يقصر نشر وإشراف المساعد على صلاحية المجتمع وبيانات سنتر المالك", () => {
    const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
    expect(router).toContain('resolveCenterScope(ctx.user.id, "community")');
    expect(router).toContain('scope.role === "assistant" ? "assistant" : "teacher"');
    expect(router).toContain("resolveCenterWorkspace(scope, input.workspace)");
    expect(router).toContain("removeGroupDiscussionMessage(scope.dataUserId");
  });
});
