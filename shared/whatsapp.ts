export type CollectionPeriod = "monthly" | "term" | "per_lesson";

export function collectionPeriodLabel(period?: CollectionPeriod) {
  if (period === "term") return "رسوم الترم";
  if (period === "per_lesson") return "رسوم الحصة";
  return "الرسوم الشهرية";
}

export function formatOutstandingWhatsAppMessage(input: { studentName: string; groupName: string; remainingAmount: number; collectionPeriod?: CollectionPeriod }) {
  const amount = Number(input.remainingAmount || 0).toLocaleString("ar-EG");
  const period = collectionPeriodLabel(input.collectionPeriod);
  return `مرحبًا، نود تذكيركم بأن على الطالب ${input.studentName} مبلغًا متبقيًا قدره ${amount} ج.م في مجموعة ${input.groupName} (${period}). يرجى سداد المبلغ في أقرب وقت. شكرًا لكم.`;
}

export function formatSubscriptionWhatsAppMessage(input: { studentName: string; groupName: string; joinedAt: Date | string | null | undefined; paidAmount: number; remainingAmount: number }) {
  const date = input.joinedAt ? new Date(input.joinedAt).toLocaleDateString("ar-EG") : "تاريخ التسجيل";
  const paid = Number(input.paidAmount || 0).toLocaleString("ar-EG");
  const remaining = Number(input.remainingAmount || 0).toLocaleString("ar-EG");
  return `مرحباً ${input.studentName}\nتم الاشتراك في مجموعة ${input.groupName} بتاريخ ${date}.\nتم دفع مبلغ ${paid} ج.م، والمبلغ المتبقي ${remaining} ج.م.`;
}

export function formatWeeklyWhatsAppReport(input: { studentName: string; groupName: string; present: number; absent: number; late: number; assessments: string[]; homework: string[]; paidAmount: number; remainingAmount: number }) {
  const assessments = input.assessments.length ? input.assessments.join("، ") : "لا توجد تقييمات مسجلة هذا الأسبوع";
  const homework = input.homework.length ? input.homework.join("، ") : "لا توجد واجبات مسجلة هذا الأسبوع";
  return `تقرير أسبوعي للطالب ${input.studentName}\nالمجموعة: ${input.groupName}\nالحضور: ${input.present} حاضر · ${input.late} متأخر · ${input.absent} غائب\nالتقييمات: ${assessments}\nالواجبات: ${homework}\nالمدفوع: ${Number(input.paidAmount || 0).toLocaleString("ar-EG")} ج.م\nالمتبقي: ${Number(input.remainingAmount || 0).toLocaleString("ar-EG")} ج.م\nمع أطيب التمنيات بالتوفيق.`;
}
