export type ChangeLogCategory = "student" | "group" | "attendance" | "finance" | "assessment" | "settings";
export type ChangeLogAction = "created" | "updated" | "deleted" | "recorded" | "settled";

export const changeLogCategoryLabels: Record<ChangeLogCategory, string> = {
  student: "الطلاب",
  group: "المجموعات",
  attendance: "الحضور",
  finance: "المالية",
  assessment: "التقييمات",
  settings: "الإعدادات",
};

export const changeLogActionLabels: Record<ChangeLogAction, string> = {
  created: "إضافة",
  updated: "تعديل",
  deleted: "حذف",
  recorded: "تسجيل",
  settled: "تحصيل",
};
