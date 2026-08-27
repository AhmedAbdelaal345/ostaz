import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { formatSubscriptionWhatsAppMessage, formatWeeklyWhatsAppReport } from "../shared/whatsapp";

const root = path.resolve(import.meta.dirname, "..");

describe("daily student follow-up contracts", () => {
  it("includes start, end, paid, and remaining information in the subscription message", () => {
    const message = formatSubscriptionWhatsAppMessage({
      studentName: "سارة",
      groupName: "ثالثة إعدادي",
      joinedAt: new Date("2026-08-01T00:00:00.000Z"),
      endsAt: new Date("2026-09-01T00:00:00.000Z"),
      paidAmount: 150,
      remainingAmount: 50,
    });
    expect(message).toContain("مجموعة ثالثة إعدادي");
    expect(message).toContain("تاريخ انتهاء الاشتراك");
    expect(message).toContain("١٥٠");
    expect(message).toContain("٥٠");
  });

  it("keeps recitation, homework, assessments, and monthly label in the generated report", () => {
    const message = formatWeeklyWhatsAppReport({
      studentName: "سارة",
      groupName: "ثالثة إعدادي",
      present: 3,
      late: 1,
      absent: 0,
      assessments: ["اختبار الوحدة: 8/10"],
      recitation: ["١/٨/٢٠٢٦: ممتاز (م)"],
      homework: ["١/٨/٢٠٢٦: جيد (ج)"],
      paidAmount: 150,
      remainingAmount: 50,
      period: "monthly",
    });
    expect(message).toContain("تقرير شهري");
    expect(message).toContain("التسميع");
    expect(message).toContain("الواجبات");
    expect(message).toContain("اختبار الوحدة");
  });

  it("persists one daily follow-up per student, group, workspace, and day", () => {
    const schema = fs.readFileSync(path.join(root, "drizzle/schema.ts"), "utf8");
    const router = fs.readFileSync(path.join(root, "server/routers.ts"), "utf8");
    const profile = fs.readFileSync(path.join(root, "client/src/pages/EntityProfile.tsx"), "utf8");
    expect(schema).toContain("student_daily_followups");
    expect(schema).toContain("student_followup_day_unique");
    expect(router).toContain("dailyFollowUps: router");
    expect(profile).toContain("student-daily-card");
    expect(profile).toContain("التسميع");
    expect(profile).toContain("رسالة الاشتراك");
  });
});
