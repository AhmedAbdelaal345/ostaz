import type { AppLanguage } from "@/contexts/LanguageContext";

const englishAuthMessages: Record<string, string> = {
  "يوجد حساب معلم مسجل بهذا الرقم. استخدم تسجيل الدخول.": "A teacher account already uses this phone number. Please log in.",
  "رقم الهاتف أو كلمة المرور غير صحيحين.": "The phone number or password is incorrect.",
  "حساب المدرس غير موجود. راجع رقم المدرس المسجل في المنصة.": "Teacher account not found. Check the teacher phone number registered on the platform.",
  "رقم الطالب غير مسجل داخل مساحة هذا المدرس. اطلب من المدرس إضافتك أولًا.": "This student phone is not registered in this teacher's workspace. Ask the teacher to add you first.",
  "يوجد حساب طالب لهذا المدرس بهذا الرقم. استخدم تسجيل الدخول.": "A student account already exists for this number. Please log in.",
  "هذا الطالب مرتبط بحساب بالفعل. استخدم تسجيل الدخول أو تواصل مع المدرس.": "This student already has an account. Please log in or contact the teacher.",
  "رقم المدرس أو رقم الطالب أو كلمة المرور غير صحيحة.": "The teacher phone, student phone, or password is incorrect.",
};

export function localizeAuthMessage(message: string, language: AppLanguage) {
  return language === "en" ? englishAuthMessages[message] || message : message;
}
