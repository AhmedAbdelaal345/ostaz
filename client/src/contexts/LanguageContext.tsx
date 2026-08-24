import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "ar" | "en";

const dictionary = {
  ar: {
    home: "الرئيسية", attendance: "الحضور", groups: "المجموعات", finance: "المالية", settings: "الإعدادات",
    all: "الكل", school: "المدرسة", center: "السنتر", online: "أونلاين",
    personalWorkspace: "مساحة المعلم الشخصية", lightMode: "الوضع النهاري", darkMode: "الوضع الليلي", backup: "نسخة احتياطية",
    reports: "تقارير", notifications: "التنبيهات", profile: "الملف الشخصي", greeting: "مرحبًا،", teacher: "يا أستاذ",
    weeklyExams: "الامتحانات الأسبوعية", contextReports: "تقارير السياقات", language: "اللغة", arabic: "العربية", english: "English",
    controlCenter: "مركز التحكم", appSettings: "الإعدادات", languageTitle: "لغة التطبيق", languageText: "اختر لغة الواجهة واتجاهها. سيُحفظ اختيارك على هذا الجهاز.",
    languageSaved: "تم تغيير لغة التطبيق", theme: "الوضع", dark: "ليلي", light: "عادي", automatic: "أوتوماتيك",
    plans: "الباقات", messages: "رسائل WhatsApp", data: "البيانات", payment: "بيانات الدفع", contact: "بيانات التواصل", security: "أمان الحساب", changes: "سجل التعديلات", team: "فريق المركز", pushTitle: "إشعارات Push", fastMessaging: "التواصل السريع", templateTitle: "قوالب رسائل WhatsApp", templateHint: "يحفظ التطبيق القالب ويملأ متغيراته عند فتح رسالة WhatsApp للطالب أو ولي الأمر. لا يرسل التطبيق رسائل تلقائيًا من دون موافقتك أو مزوّد رسائل خارجي.", preview: "معاينة على بيانات نموذجية", saveTemplate: "حفظ القالب", pushHint: "فعّل التنبيهات ليصلك إشعار حتى عند إغلاق التطبيق، مثل مراجعة المتأخرين أو المستحقات.", permission: "حالة الإذن", enabled: "مفعّل", blocked: "محظور من المتصفح", waiting: "بانتظار موافقتك", pushNeedsSetup: "خدمة الإشعارات غير مهيأة بعد على الخادم؛ لن يظهر زر تفعيل وهمي إلى أن تكتمل مفاتيح Push.", pushUnavailable: "خدمة Push غير مهيأة", enablePush: "تفعيل إشعارات Push", updatePush: "تحديث اشتراك الإشعارات",
  },
  en: {
    home: "Home", attendance: "Attendance", groups: "Groups", finance: "Finance", settings: "Settings",
    all: "All", school: "School", center: "Center", online: "Online",
    personalWorkspace: "Teacher workspace", lightMode: "Light mode", darkMode: "Dark mode", backup: "Backup",
    reports: "Reports", notifications: "Notifications", profile: "Profile", greeting: "Welcome,", teacher: "Teacher",
    weeklyExams: "Weekly exams", contextReports: "Context reports", language: "Language", arabic: "العربية", english: "English",
    controlCenter: "Control center", appSettings: "Settings", languageTitle: "App language", languageText: "Choose the interface language and direction. Your choice is saved on this device.",
    languageSaved: "App language updated", theme: "Appearance", dark: "Dark", light: "Light", automatic: "Automatic",
    plans: "Plans", messages: "WhatsApp messages", data: "Data", payment: "Payment details", contact: "Contact details", security: "Account security", changes: "Change log", team: "Center team", pushTitle: "Push notifications", fastMessaging: "Quick messaging", templateTitle: "WhatsApp message templates", templateHint: "The app saves this template and fills its variables when you open a WhatsApp message for a student or guardian. It never sends messages automatically without your approval or an external messaging provider.", preview: "Preview with sample data", saveTemplate: "Save template", pushHint: "Enable notifications to receive alerts even when the app is closed, such as late-attendance and payment reminders.", permission: "Permission", enabled: "Enabled", blocked: "Blocked by browser", waiting: "Waiting for your approval", pushNeedsSetup: "Push delivery is not configured on the server yet, so no misleading activation button is shown until the Push keys are set.", pushUnavailable: "Push service unavailable", enablePush: "Enable Push notifications", updatePush: "Refresh notification subscription",
  },
} as const;

type TranslationKey = keyof typeof dictionary.ar;
type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (key: TranslationKey) => string; isRtl: boolean };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(() => localStorage.getItem("el-mister-language") === "en" ? "en" : "ar");
  useEffect(() => {
    const isRtl = language === "ar";
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.dataset.language = language;
    localStorage.setItem("el-mister-language", language);
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: TranslationKey) => dictionary[language][key], isRtl: language === "ar" }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
