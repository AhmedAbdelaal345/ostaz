export function formatOutstandingWhatsAppMessage(input: { studentName: string; groupName: string; remainingAmount: number; collectionPeriod?: "monthly" | "term" }) {
  const amount = Number(input.remainingAmount || 0).toLocaleString("ar-EG");
  const period = input.collectionPeriod === "term" ? "رسوم الترم" : "الرسوم الشهرية";
  return `مرحبًا، نود تذكيركم بأن على الطالب ${input.studentName} مبلغًا متبقيًا قدره ${amount} ج.م في مجموعة ${input.groupName} (${period}). يرجى سداد المبلغ في أقرب وقت. شكرًا لكم.`;
}
