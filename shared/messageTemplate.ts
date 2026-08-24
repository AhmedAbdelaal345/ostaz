export type MessageTemplateValues = { studentName: string; groupName: string; date: string; teacherName: string; amount?: string | number };

export function renderMessageTemplate(template: string, values: MessageTemplateValues) {
  return template.replaceAll("{اسم الطالب}", values.studentName).replaceAll("{المجموعة}", values.groupName).replaceAll("{التاريخ}", values.date).replaceAll("{اسم المعلم}", values.teacherName).replaceAll("{المبلغ}", values.amount === undefined ? "" : String(values.amount));
}
