import { describe, expect, it } from "vitest";
import { buildMonthlyPerformanceCards, buildPerformanceLeaderboard } from "../shared/performanceSummary";

describe("ترتيب وتقارير الأداء", () => {
  const students = [{ id: 1, name: "أحمد" }, { id: 2, name: "سارة" }];
  const rows = [{ studentId: 1, period: "weekly", score: "9", maxScore: "10", createdAt: new Date("2026-08-10") }, { studentId: 2, period: "weekly", score: "8", maxScore: "10", createdAt: new Date("2026-08-10") }, { studentId: 2, period: "monthly", score: "18", maxScore: "20", createdAt: new Date("2026-08-12") }];
  it("يرتب الطلاب بحسب نسبة درجات التقييم", () => { expect(buildPerformanceLeaderboard(students, rows, "weekly", new Date("2026-08-20")).map(row => row.name)).toEqual(["أحمد", "سارة"]); });
  it("ينشئ بطاقة شهرية من تقييمات الشهر الحالي فقط", () => { const cards = buildMonthlyPerformanceCards(students, rows, new Date("2026-08-20")); expect(cards[0]).toMatchObject({ name: "سارة", rank: 1, percentage: 90, status: "متميز" }); });
});
