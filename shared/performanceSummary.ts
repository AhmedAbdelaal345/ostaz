export type PerformanceAssessment = { studentId: number; score: string | number | null; maxScore: string | number | null; period: string; createdAt: Date | string };
export type PerformanceStudent = { id: number; name: string; groupId?: number | null };

export function buildPerformanceLeaderboard(students: PerformanceStudent[], assessments: PerformanceAssessment[], period: "weekly" | "monthly", now = new Date()) {
  const currentMonth = now.getMonth(); const currentYear = now.getFullYear();
  const rows = assessments.filter(row => row.period === period && row.score !== null && row.maxScore !== null).filter(row => period !== "monthly" || (() => { const date = new Date(row.createdAt); return date.getMonth() === currentMonth && date.getFullYear() === currentYear; })());
  return students.map(student => { const own = rows.filter(row => row.studentId === student.id); const earned = own.reduce((sum, row) => sum + Number(row.score), 0); const max = own.reduce((sum, row) => sum + Number(row.maxScore), 0); return { studentId: student.id, name: student.name, earned, max, percentage: max > 0 ? Math.round((earned / max) * 100) : 0, count: own.length }; }).filter(row => row.count > 0).sort((a, b) => b.percentage - a.percentage || b.earned - a.earned || a.name.localeCompare(b.name, "ar"));
}

export function buildMonthlyPerformanceCards(students: PerformanceStudent[], assessments: PerformanceAssessment[], now = new Date()) {
  const monthly = buildPerformanceLeaderboard(students, assessments, "monthly", now);
  return monthly.map((row, index) => ({ ...row, rank: index + 1, status: row.percentage >= 85 ? "متميز" : row.percentage >= 65 ? "جيد" : "يحتاج متابعة" }));
}
