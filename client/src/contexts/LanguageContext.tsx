import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "ar" | "en";

const dictionary = {
  ar: {
    home: "الرئيسية", attendance: "الحضور", groups: "المجموعات", finance: "المالية", settings: "الإعدادات",
    all: "الكل", school: "المدرسة", center: "السنتر", online: "أونلاين",
    personalWorkspace: "مساحة المعلم الشخصية", brandSubtitle: "المستر لإدارة التعليم", lightMode: "الوضع النهاري", darkMode: "الوضع الليلي", backup: "نسخة احتياطية",
    reports: "تقارير", notifications: "التنبيهات", profile: "الملف الشخصي", greeting: "مرحبًا،", teacher: "يا أستاذ",
    weeklyExams: "الامتحانات الأسبوعية", contextReports: "تقارير السياقات", language: "اللغة", arabic: "العربية", english: "English",
    controlCenter: "مركز التحكم", appSettings: "الإعدادات", languageTitle: "لغة التطبيق", languageText: "اختر لغة الواجهة واتجاهها. سيُحفظ اختيارك على هذا الجهاز.",
    languageSaved: "تم تغيير لغة التطبيق", theme: "الوضع", dark: "ليلي", light: "عادي", automatic: "أوتوماتيك",
    plans: "الباقات", messages: "رسائل WhatsApp", data: "البيانات", payment: "بيانات الدفع", contact: "بيانات التواصل", security: "أمان الحساب", changes: "سجل التعديلات", team: "فريق المركز", pushTitle: "إشعارات Push", fastMessaging: "التواصل السريع", templateTitle: "قوالب رسائل WhatsApp", templateHint: "يحفظ التطبيق القالب ويملأ متغيراته عند فتح رسالة WhatsApp للطالب أو ولي الأمر. لا يرسل التطبيق رسائل تلقائيًا من دون موافقتك أو مزوّد رسائل خارجي.", preview: "معاينة على بيانات نموذجية", saveTemplate: "حفظ القالب", pushHint: "فعّل التنبيهات وأرسل اختبارًا إلى هاتفك. لا تعتمد على تنبيه الخلفية قبل التأكد من ظهوره على جهازك.", permission: "حالة الإذن", enabled: "مفعّل", blocked: "محظور من المتصفح", waiting: "بانتظار موافقتك", pushNeedsSetup: "خدمة الإشعارات غير مهيأة بعد على الخادم؛ لن يظهر زر تفعيل وهمي إلى أن تكتمل مفاتيح Push.", pushUnavailable: "خدمة Push غير مهيأة", enablePush: "تفعيل إشعارات Push", updatePush: "تحديث اشتراك الإشعارات",
  },
  en: {
    home: "Home", attendance: "Attendance", groups: "Groups", finance: "Finance", settings: "Settings",
    all: "All", school: "School", center: "Center", online: "Online",
    personalWorkspace: "Teacher workspace", brandSubtitle: "Education management", lightMode: "Light mode", darkMode: "Dark mode", backup: "Backup",
    reports: "Reports", notifications: "Notifications", profile: "Profile", greeting: "Welcome,", teacher: "Teacher",
    weeklyExams: "Weekly exams", contextReports: "Context reports", language: "Language", arabic: "Arabic", english: "English",
    controlCenter: "Control center", appSettings: "Settings", languageTitle: "App language", languageText: "Choose the interface language and direction. Your choice is saved on this device.",
    languageSaved: "App language updated", theme: "Appearance", dark: "Dark", light: "Light", automatic: "Automatic",
    plans: "Plans", messages: "WhatsApp messages", data: "Data", payment: "Payment details", contact: "Contact details", security: "Account security", changes: "Change log", team: "Center team", pushTitle: "Push notifications", fastMessaging: "Quick messaging", templateTitle: "WhatsApp message templates", templateHint: "The app saves this template and fills its variables when you open a WhatsApp message for a student or guardian. It never sends messages automatically without your approval or an external messaging provider.", preview: "Preview with sample data", saveTemplate: "Save template", pushHint: "Enable notifications and send a test to your phone. Do not rely on background alerts until you have seen one on this device.", permission: "Permission", enabled: "Enabled", blocked: "Blocked by browser", waiting: "Waiting for your approval", pushNeedsSetup: "Push delivery is not configured on the server yet, so no misleading activation button is shown until the Push keys are set.", pushUnavailable: "Push service unavailable", enablePush: "Enable Push notifications", updatePush: "Refresh notification subscription",
  },
} as const;

/**
 * Legacy screens were authored before the language context existed. Keeping
 * their source text in Arabic preserves the primary RTL experience, while this
 * catalogue translates the static interface copy when English is selected.
 * It deliberately matches complete phrases only, never student/teacher data.
 */
const legacyEnglishText: Record<string, string> = {
  "المستر لإدارة التعليم": "Education management", "تم تحميل النسخة الاحتياطية": "Backup downloaded", "لا توجد تنبيهات جديدة": "No new notifications",
  "اختر صورة PNG أو JPG أو WEBP بحجم لا يتجاوز 2.5 ميجابايت": "Choose a PNG, JPG, or WEBP image no larger than 2.5 MB", "تم تحديث الصورة الشخصية": "Profile photo updated", "أكمل الاسم والمادة أولاً": "Complete the name and subject first", "تم حفظ الملف وتفعيل دخول الهاتف": "Profile saved and phone sign-in enabled", "تم حفظ بياناتك ومزامنتها": "Your details were saved and synced", "تعذر حفظ بياناتك الآن": "Your details could not be saved right now",
  "الصورة الشخصية للمعلم": "Teacher profile photo", "تغيير الصورة": "Change photo", "ملفك الشخصي": "Your profile", "بيانات المعلم": "Teacher details", "هذه البيانات تظهر في مساحة المعلم ورسائله.": "These details appear in the teacher workspace and messages.", "اسم المعلم": "Teacher name", "مثال: أ/ أحمد محمود": "Example: Mr Ahmed Mahmoud", "رقم الهاتف / واتساب": "Phone / WhatsApp", "المادة الأساسية": "Main subject", "اختر المادة": "Choose a subject", "كلمة مرور دخول الهاتف": "Phone sign-in password", "اتركها فارغة إن لم ترد تغييرها": "Leave it blank to keep it unchanged", "8 أحرف على الأقل": "At least 8 characters", "حفظ وتفعيل دخول الهاتف": "Save and enable phone sign-in", "حفظ التعديلات": "Save changes",
  "تم تنزيل تقرير PDF": "PDF report downloaded", "بطاقة طالب": "Student card", "كود الطالب:": "Student code:", "ولي الأمر:": "Guardian:", "بدون هاتف": "No phone", "الحساب مسدد": "Account settled", "فتح بروفايل الطالب": "Open student profile", "رسالة WhatsApp": "WhatsApp message", "طباعة البطاقة": "Print card",
  "تعذر تشغيل الكاميرا": "Camera could not be started", "لم يتم العثور على طالب بهذا الكود": "No student was found with this code", "تسجيل لحظي": "Instant check-in", "تسجيل حضور سريع": "Quick attendance check-in", "امسح QR أو اكتب كود الطالب لتسجيل حضوره في حصة اليوم.": "Scan the QR code or enter the student code to record attendance for today's lesson.", "كود الطالب": "Student code", "تسجيل": "Check in", "إيقاف الكاميرا": "Stop camera", "فتح الكاميرا": "Open camera", "وجّه الكاميرا إلى كود الطالب": "Point the camera at the student code", "المتصفح لا يدعم المسح التلقائي؛ استخدم الإدخال اليدوي": "This browser does not support automatic scanning; use manual entry",
  "حاضر": "Present", "غائب": "Absent", "متأخر": "Late", "حضور حصة اليوم": "Today's lesson attendance", "المتأخرون يظهرون أولًا": "Late students appear first", "بروفايل المجموعة": "Group profile", "لم يُسجل بعد": "Not recorded yet", "مسدد": "Settled", "واتساب": "WhatsApp", "لا يوجد طلاب مرتبطون بهذه المجموعة بعد.": "No students are linked to this group yet.",
  "عام": "General", "اكتب مبلغًا صحيحًا": "Enter a valid amount", "مصروف تشغيلي": "Operating expense", "اشتراك طالب": "Student subscription", "الخزينة والمستحقات": "Treasury and dues", "السجل المالي": "Financial ledger", "مزامنة سحابية": "Cloud sync", "تصدير السجل PDF": "Export ledger PDF", "تصفية حسب": "Filter by", "كل المجموعات والبرايفت": "All groups and private lessons", "البرايفت فقط": "Private lessons only", "المجموعات فقط": "Groups only", "اختار المجموعة": "Choose group", "كل المجموعات": "All groups", "الفترة المالية": "Financial period", "كل الشهور": "All months", "مدفوع": "Paid", "متبقي": "Outstanding", "إيرادات محصلة": "Collected income", "اشتراكات مسددة": "Paid subscriptions", "المصروفات": "Expenses", "تشغيلية": "Operating", "صافي الخزينة": "Net balance", "إيرادات ناقص مصروفات": "Income minus expenses", "متأخرات": "Overdue", "حالة تحتاج متابعة": "Needs follow-up", "إضافة حركة": "Add transaction", "تسجيل اشتراك أو مصروف": "Record a subscription or expense", "اشتراك": "Subscription", "مصروف": "Expense", "الطالب": "Student", "اختر الطالب": "Choose a student", "المجموعة": "Group", "اختر المجموعة": "Choose group", "موعد الاستحقاق": "Due date", "المبلغ": "Amount", "الوصف": "Description", "ملاحظة اختيارية": "Optional note", "حفظ الحركة": "Save transaction", "المتابعة": "Follow-up", "المستحقات المتأخرة": "Overdue dues", "تحصيل": "Collect", "لا توجد مستحقات متأخرة": "No overdue dues", "الحركات المطابقة": "Matching transactions", "حركة": "transaction", "بدون استحقاق": "No due date", "لا توجد سجلات دفع مطابقة": "No matching payment records",
  "متابعة الطالب": "Student follow-up", "السلوك والملاحظات": "Behaviour and notes", "سجل سحابي": "Cloud record", "إضافة سجل سريع": "Add quick record", "ملاحظة جديدة": "New note", "نوع الملاحظة": "Note type", "إيجابي": "Positive", "تنبيه": "Warning", "ملاحظة": "Note", "العنوان": "Title", "مثال: مشاركة مميزة": "Example: Excellent participation", "التفاصيل": "Details", "اكتب ملاحظة مختصرة للمتابعة": "Write a brief follow-up note", "النقاط": "Points", "حفظ الملاحظة": "Save note", "السجل": "History", "آخر ملاحظات الطلاب": "Latest student notes", "لم تُسجل ملاحظات سلوكية بعد": "No behaviour notes have been recorded yet",
  "إعدادات اليوم": "Day settings", "ضبط اليوم المدرسي": "Configure the school day", "تحكم في طابور الصباح ومدة الحصص والفسحة لتخصيص العداد المباشر.": "Set assembly, lesson duration, and break time to customize the live tracker.", "طابور الصباح": "Morning assembly", "مدة الحصة بالدقائق": "Lesson duration in minutes", "الفسحة بعد حصة": "Break after lesson", "مدة الفسحة بالدقائق": "Break duration in minutes", "حفظ إعدادات اليوم": "Save day settings",
  "OCR بالذكاء الاصطناعي": "AI OCR", "اقرأ جدولًا ورقيًا": "Read a paper timetable", "التقط صورة واضحة للجدول، ثم راجع الخانات يدويًا قبل حفظها داخل النظام.": "Take a clear timetable photo, then review the entries manually before saving.", "جارٍ التحليل...": "Analysing...", "اختيار صورة الجدول": "Choose timetable image", "الحصة": "Lesson", "أوف": "Off", "نشطة": "Active",
  "تقييمات الطلاب": "Student assessments", "إنشاء تقييم": "Create assessment", "الدرجة": "Score", "الدرجة الكلية": "Maximum score", "حفظ التقييم": "Save assessment", "التقييمات": "Assessments", "لا توجد تقييمات بعد": "No assessments yet", "عرض تقرير الأداء": "View performance report", "تنزيل تقرير الأداء": "Download performance report",
  "إضافة مجموعة": "Add group", "إضافة طالب": "Add student", "بحث": "Search", "بحث بالاسم أو الهاتف أو الكود": "Search by name, phone, or code", "لا توجد مجموعات": "No groups", "المزيد": "More", "تعديل": "Edit", "حذف": "Delete", "إغلاق": "Close", "عودة": "Back", "حفظ": "Save", "إلغاء": "Cancel", "اليوم": "Today", "الحصص المجدولة": "Scheduled lessons", "لا توجد حصص مجدولة اليوم": "No lessons are scheduled today", "عرض الجدول": "View timetable", "اختبارات سريعة": "Quick actions", "ماذا تريد أن تنجز؟": "What would you like to do?", "إنشاء امتحان أسبوعي": "Create weekly exam", "طالب جديد": "New student", "عرض الإحصائيات": "View statistics",
  "أقرب حصة": "Next lesson", "لا توجد حصص مجدولة": "No scheduled lessons", "أضف مجموعة لعرض أقرب موعد.": "Add a group to see the next lesson.", "لا توجد حصص مجدولة لليوم": "No lessons are scheduled for today", "يمكنك إضافة أو تعديل مواعيد المجموعات.": "You can add a group or edit its schedule.", "اختصارات سريعة": "Quick actions", "إضافة طالب جديد": "Add new student", "متابعة السلوك": "Behaviour follow-up",
  "بيانات المجموعة": "Group details", "اسم المجموعة": "Group name", "مكان المجموعة": "Group location", "نوع المجموعة": "Group type", "حضوري": "In person", "عن بُعد": "Remote", "رسوم الاشتراك": "Subscription fee", "شهري": "Monthly", "بالترم": "Per term", "مواعيد المجموعة": "Group times", "طلاب المجموعة": "Group students", "لا يوجد طلاب في هذه المجموعة": "There are no students in this group", "تم حفظ المجموعة": "Group saved", "تم حذف المجموعة": "Group deleted", "تم حفظ الطالب": "Student saved", "تم حذف الطالب": "Student deleted",
  "إعدادات التطبيق": "App settings", "ذكّرني": "Remind me", "المواد التعليمية": "Learning materials", "المكافآت والنقاط": "Rewards and points", "وضع المدرسة": "School mode", "أعمال السنة": "Year work", "إدارة المركز": "Center management", "النسخ الاحتياطي": "Backup", "استعادة البيانات": "Restore data", "رفع ملف": "Upload file", "تصدير Excel": "Export Excel", "استيراد Excel": "Import Excel", "لا توجد بيانات بعد": "No data yet", "جارٍ الحفظ...": "Saving...", "جارٍ التحميل...": "Loading...", "تعذر الحفظ": "Could not save", "حدث خطأ، حاول مرة أخرى": "Something went wrong. Please try again.",
  "المؤشر المباشر": "Live tracker", "الحصة الحالية": "Current lesson", "الحصة القادمة": "Next lesson", "اليوم الدراسي": "School day", "لا توجد حصة مجدولة": "No lesson is scheduled", "مستمرة": "In progress", "العودة للجدول": "Back to timetable", "الأحد": "Sunday", "الاثنين": "Monday", "الثلاثاء": "Tuesday", "الأربعاء": "Wednesday", "الخميس": "Thursday", "الجمعة": "Friday", "السبت": "Saturday",
  "الإثنين": "Monday", "رجوع": "Back", "ملف تشغيلي": "Operational profile", "جارٍ تجهيز البروفايل...": "Preparing profile...", "بروفايل خاص بالمعلم": "Teacher-only profile", "سجّل الدخول للوصول إلى البيانات المعزولة لطلابك ومجموعاتك.": "Sign in to access your students' and groups' isolated data.", "جارٍ تحميل ملف الطالب...": "Loading student profile...", "جارٍ تحميل ملف المجموعة...": "Loading group profile...", "الرابط غير صالح.": "This link is invalid.", "الطالب غير موجود": "Student not found", "المجموعة غير موجودة": "Group not found", "تأكد من رابط البروفايل.": "Check the profile link.", "لا يمكن العثور على هذا الطالب ضمن حسابك.": "This student could not be found in your account.", "لا يمكن العثور على هذه المجموعة ضمن حسابك.": "This group could not be found in your account.", "بيانات التواصل": "Contact details", "هاتف الطالب": "Student phone", "ولي الأمر": "Guardian", "هاتف ولي الأمر": "Guardian phone", "غير مسجل": "Not recorded", "غير محددة": "Not assigned", "آخر الحضور": "Latest attendance", "لا توجد سجلات حضور بعد.": "No attendance records yet.", "تم السداد": "Paid", "مستحق": "Due", "لا توجد عمليات مالية بعد.": "No financial transactions yet.", "سجل السلوك": "Behaviour log", "لا توجد ملاحظات سلوكية بعد.": "No behaviour notes yet.", "الغياب المسجل": "Recorded absences", "لا يوجد طلاب مرتبطون بعد.": "No students are linked yet.", "الجدول والتحصيل": "Timetable and collections", "الموعد": "Schedule", "رسوم الطالب": "Student fee", "عدد التقييمات": "Assessment count", "عمليات مالية": "Financial transactions",
  "تسجيل الدخول": "Sign in", "إنشاء حساب": "Create account", "تسجيل الخروج": "Sign out", "رقم الهاتف": "Phone number", "كلمة المرور": "Password", "تأكيد كلمة المرور": "Confirm password", "الاسم": "Name", "العمر": "Age", "الصف الدراسي": "Grade", "تحديث البيانات": "Update details", "الحساب والأجهزة": "Account and devices", "الأجهزة المتصلة": "Connected devices", "آخر تسجيل دخول": "Last sign-in", "إنهاء الجلسة": "End session",
  "الرصيد": "Balance", "نقاط": "points", "طلب استبدال": "Request redemption", "طلبات الاستبدال": "Redemption requests", "اعتماد": "Approve", "رفض": "Reject", "سجل النقاط": "Points history", "مكافأة": "Reward", "خصم اشتراك الشهر القادم": "Next-month subscription discount", "ملزمة مجانية": "Free booklet", "هدية عينية": "Physical gift", "خصم اشتراك التطبيق": "App subscription discount"
  ,"معاينة امتحان الطالب": "Student exam preview", "معاينة الطالب": "Student preview", "التقييم الأسبوعي": "Weekly assessment", "المجموعة المختارة": "Selected group", "من": "out of", "إغلاق المعاينة": "Close preview", "هذه معاينة فقط؛ لن تُحفظ أي إجابات أو تُنشر للطلاب.": "This is a preview only. No answers will be saved or published to students.", "السؤال": "Question", "درجة": "points", "اكتب نص السؤال هنا": "Write the question text here", "الاختيار": "Option", "صح": "True", "خطأ": "False", "اكتب إجابتك هنا...": "Write your answer here...", "إجابات تجريبية:": "Sample answers:", "العودة إلى التعديل": "Back to editing", "تم إنشاء الاختبار الأسبوعي": "Weekly exam created", "تمت قراءة الكود والدرجة؛ راجعهما ثم اضغط رصد الدرجة": "The code and score were read. Review them, then record the score.", "تعذر قراءة ورقة الإجابة": "Answer sheet could not be read", "اختر المجموعة واكتب عنوان الاختبار": "Choose a group and enter an exam title", "أكمل نص ودرجة كل سؤال واختياراته": "Complete each question's text, score, and options", "اختر الاختبار المقال أولًا": "Choose the essay exam first", "اختبارات المجموعة": "Group exams", "إنشاء اختبار أسبوعي إلكتروني": "Create an online weekly exam", "حدّد الوقت والقالب، ثم راجع شكله كطالب قبل النشر.": "Set the time and template, then review it as a student before publishing.", "عنوان الاختبار": "Exam title", "يفتح في": "Opens at", "يغلق في": "Closes at", "اختيار من متعدد": "Multiple choice", "صح أو خطأ": "True or false", "مقالي": "Essay", "نص السؤال": "Question text", "اكتب السؤال": "Write the question", "الإجابة الصحيحة": "Correct answer", "إضافة سؤال": "Add question", "المجموع:": "Total:", "نشر الاختبار": "Publish exam", "المتابعة والرصد": "Follow-up and marking", "نتائج الاختبارات": "Exam results", "اختياري": "Multiple choice", "صح/خطأ": "True/False", "لم تُنشئ اختبارًا أسبوعيًا بعد.": "You have not created a weekly exam yet.", "تصحيح": "Marking", "يدوي": "Manual", "بكود الطالب": "by student code", "جارٍ قراءة الورقة...": "Reading sheet...", "مسح ورقة الإجابة": "Scan answer sheet", "كود الطالب (4 أرقام)": "Student code (4 digits)", "رصد الدرجة": "Record score", "بانتظار التصحيح": "Awaiting marking", "لا توجد محاولات مسلمة بعد.": "No submitted attempts yet."
};

Object.assign(legacyEnglishText, {
  "معاينة قبل القراءة": "Preview before reading", "تأكد من وضوح الجدول": "Confirm that the timetable is clear", "لن تُرسل الصورة للذكاء الاصطناعي إلا بعد التأكيد. يمكنك إلغاء العملية واختيار صورة أخرى.": "The image will not be sent to AI until you confirm. You can cancel and choose another image.", "معاينة جدول المدرسة": "School timetable preview", "صورة الجدول": "Timetable image", "اختيار صورة أخرى": "Choose another image", "جارٍ القراءة...": "Reading...", "إرسال للذكاء الاصطناعي": "Send to AI",
  "مراجعة يدويّة": "Manual review", "راجِع النتائج قبل الاعتماد": "Review results before approval", "عدّل اليوم أو رقم الحصة أو المادة أو الفصل. اختر «فترة» عندما يكون النشاط مدته ضعف مدة الحصة.": "Edit the day, lesson number, subject, or classroom. Choose Period when an activity lasts twice a lesson length.", "فترة ×2": "Period ×2", "المادة أو النشاط": "Subject or activity", "الفصل": "Classroom", "حذف الخانة": "Delete row", "إضافة خانة": "Add row", "اعتماد وحفظ الجدول": "Approve and save timetable",
  "مساعد أعمال السنة": "Year work assistant", "تم حفظ جدول المدرسة والتقييم الأسبوعي": "School timetable and weekly assessment saved", "تم حفظ إعداد تذكير نهاية الحصة.": "End-of-lesson reminder setting saved.", "تقييم أسبوعي": "Weekly assessment", "لم تُستخرج خانات واضحة؛ اختر صورة أوضح أو أضفها يدويًا.": "No clear entries were extracted. Choose a clearer image or add them manually.", "اكتملت القراءة. راجع النتائج قبل الاعتماد.": "Reading is complete. Review the results before approval.", "احفظ مواعيد المدرسة الأساسية أولاً، ثم ارفع صورة الجدول.": "Save the core school times first, then upload the timetable image.", "تم اعتماد النتائج وحفظ جدول المدرسة.": "Results approved and school timetable saved.",
  "إدارة الحضور": "Attendance management", "الحضور السريع": "Quick attendance", "إدارة التشغيل": "Operations", "المجموعات الدراسية": "Study groups", "ابحث باسم المجموعة أو الطالب...": "Search by group or student name...", "مسح البحث": "Clear search", "تصفية المكان": "Location filter", "تصفية الطلاب": "Student filter", "بها طلاب": "With students", "فارغة": "Empty", "مسح الكل": "Clear all", "مجموعة": "group", "طالب": "student", "لا يوجد طلاب مضافون بعد.": "No students have been added yet.", "إخفاء التفاصيل": "Hide details", "لا توجد نتائج مطابقة": "No matching results", "جرّب تعديل البحث أو مسح الفلاتر للوصول إلى النتائج.": "Try changing the search or clearing filters.", "أنشئ مجموعتك الأولى لتنظيم اليوم الدراسي.": "Create your first group to organize your teaching day.", "مسح البحث والتصفية": "Clear search and filters", "أضف أول مجموعة": "Add first group",
  "مدرسة": "School", "سنتر": "Center", "أونلاين": "Online", "الكل": "All", "الخميس": "Thursday", "الترم": "Term", "شهري": "Monthly", "الجنيه": "EGP", "ج.م": "EGP", "نتيجة آخر تسجيل": "Latest check-in result", "توجد مبالغ مستحقة": "There are outstanding dues", "تحصيل المبلغ": "Collect payment", "رسالة ولي الأمر": "Guardian message", "الحساب مسدد": "Account settled",
  "مساعد أعمال السنة خاص بالمدرسة": "Year work assistant is for School only", "اختر سياق المدرسة أولًا للوصول إلى كشف درجات الترم والغياب اليومي.": "Choose the School context first to access the term gradebook and daily attendance.", "الانتقال إلى المدرسة": "Go to School"
});

Object.assign(legacyEnglishText, {
  "تم حفظ بياناتك الدراسية": "Your academic details were saved", "تم تحديث الصورة الشخصية": "Profile photo updated", "اختر صورة PNG أو JPG أو WEBP بحجم لا يتجاوز 2.5 ميجابايت": "Choose a PNG, JPG, or WEBP image up to 2.5 MB", "بياناتي": "My details", "تعديل البروفايل": "Edit profile", "تغيير الصورة": "Change photo", "مثال: الصف الثالث الإعدادي": "Example: Grade 9", "حفظ البيانات": "Save details", "تم إنشاء حسابك وربطه بسجلك الدراسي": "Your account was created and linked to your academic record", "مرحبًا بك في بروفايل الطالب": "Welcome to your student profile", "تم تسليم الإجابات للمراجعة": "Answers submitted for review", "تم رصد نتيجتك:": "Your score has been recorded:",
  "عودة إلى البروفايل": "Back to profile", "اختبار المجموعة": "Group exam", "أجب عن جميع الأسئلة ثم سلّم الاختبار قبل انتهاء الوقت.": "Answer all questions and submit before time runs out.", "انتهى وقت الاختبار": "Exam time is over", "تسليم الاختبار": "Submit exam", "جارٍ التسليم...": "Submitting...", "جارٍ التحقق من جلسة الطالب...": "Checking your student session...", "بروفايل الطالب": "Student profile", "لم تُربط مجموعة بعد": "No group linked yet", "كود الطالب:": "Student code:", "سنة": "years", "العمر غير مضاف": "Age not added", "الصف غير مضاف": "Grade not added", "تعديل": "Edit", "خروج": "Sign out", "المجموعة": "Group", "نسبة الحضور": "Attendance rate", "المستحقات": "Dues", "متابعة": "follow-up", "مسدد": "Paid", "اختباراتك": "Your exams", "الاختبارات الأسبوعية": "Weekly exams", "جارٍ تحميل الاختبارات...": "Loading exams...", "بدء الاختبار": "Start exam", "لم يبدأ": "Not started", "مغلق": "Closed", "لا توجد اختبارات أسبوعية متاحة حاليًا.": "No weekly exams are available right now.", "نتائجي": "My results", "آخر التقييمات": "Latest assessments", "لم تُسجل تقييمات بعد.": "No assessments recorded yet.",
  "يناير": "January", "فبراير": "February", "مارس": "March", "أبريل": "April", "مايو": "May", "يونيو": "June", "يوليو": "July", "أغسطس": "August", "سبتمبر": "September", "أكتوبر": "October", "نوفمبر": "November", "ديسمبر": "December"
});

Object.assign(legacyEnglishText, {
  "المحصّل": "Collected", "بطاقة الاشتراك": "Subscription card", "بيانات المجموعة والدفع": "Group and payment details", "متبقي": "Outstanding", "غير مضاف": "Not added", "تاريخ الانضمام": "Joined", "نوع الاشتراك": "Subscription type", "قيمة الاشتراك": "Subscription fee", "المبلغ المدفوع": "Paid amount", "المبلغ المتبقي": "Outstanding amount", "رسالة الاشتراك": "Subscription message", "تذكير بالمبلغ": "Payment reminder", "الرسوم الشهرية": "Monthly fee", "بيانات التواصل": "Contact details", "البيانات الدراسية": "Academic details", "العمر": "Age", "الصف الدراسي": "Grade", "آخر الحضور": "Latest attendance", "السجل المالي": "Financial ledger"
});

const originalAttributes = new WeakMap<Element, Map<string, string>>();

function translateLegacyText(source: string, language: AppLanguage) {
  if (language === "ar") return source;
  const trimmed = source.trim();
  if (trimmed.startsWith("اليوم ·")) return source.replace(trimmed, `Today · ${new Date().toLocaleDateString("en-GB")}`);
  if (trimmed.startsWith("تذكير: لدى ")) return source.replace(/تذكير: لدى (.+) مبلغ متبقٍ قدره (.+) في مجموعة (.+)\./, "Reminder: $1 has an outstanding amount of $2 in $3.");
  if (source.includes("ج.م")) return source.replaceAll("ج.م", "EGP");
  const translated = legacyEnglishText[trimmed];
  return translated ? source.replace(trimmed, translated) : source;
}

function LegacyTextLocalization() {
  const { language } = useLanguage();
  useEffect(() => {
    let frame = 0;
    const pendingRoots = new Set<Node>();
    const apply = (root: Node) => {
      const textNodes: Node[] = root.nodeType === Node.TEXT_NODE ? [root] : [];
      if (root.nodeType !== Node.TEXT_NODE) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let current: Node | null;
        while ((current = walker.nextNode())) textNodes.push(current);
      }
      textNodes.forEach(current => {
        const parent = current.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName) || parent.closest("[contenteditable='true']")) return;
        const source = (current as Text & { __elMisterSource?: string }).__elMisterSource ?? current.nodeValue ?? "";
        (current as Text & { __elMisterSource?: string }).__elMisterSource = source;
        const next = translateLegacyText(source, language);
        if (current.nodeValue !== next) current.nodeValue = next;
      });
      const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title], [alt]"))] : root.parentElement ? [root.parentElement] : [];
      elements.forEach(element => {
        const saved = originalAttributes.get(element) ?? new Map<string, string>();
        ["placeholder", "aria-label", "title", "alt"].forEach(attribute => {
          const currentValue = element.getAttribute(attribute);
          if (currentValue === null) return;
          const source = saved.get(attribute) ?? currentValue;
          saved.set(attribute, source);
          const next = translateLegacyText(source, language);
          if (currentValue !== next) element.setAttribute(attribute, next);
        });
        originalAttributes.set(element, saved);
      });
    };
    const flush = () => { frame = 0; const roots = Array.from(pendingRoots); pendingRoots.clear(); roots.forEach(apply); };
    const schedule = (node: Node) => { pendingRoots.add(node.nodeType === Node.TEXT_NODE ? node.parentElement || node : node); if (!frame) frame = window.requestAnimationFrame(flush); };
    apply(document.body);
    const observer = new MutationObserver(records => records.forEach(record => {
      if (record.type === "characterData") schedule(record.target);
      record.addedNodes.forEach(schedule);
    }));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => { observer.disconnect(); if (frame) window.cancelAnimationFrame(frame); };
  }, [language]);
  return null;
}

type TranslationKey = keyof typeof dictionary.ar;
type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (key: TranslationKey) => string; isRtl: boolean };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    const initial = requested === "en" || requested === "ar" ? requested : localStorage.getItem("el-mister-language") === "en" ? "en" : "ar";
    document.documentElement.lang = initial;
    document.documentElement.dir = initial === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.language = initial;
    return initial;
  });
  const setLanguage = (nextLanguage: AppLanguage) => {
    const isRtl = nextLanguage === "ar";
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.dataset.language = nextLanguage;
    localStorage.setItem("el-mister-language", nextLanguage);
    setLanguageState(nextLanguage);
  };
  useEffect(() => {
    const isRtl = language === "ar";
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.dataset.language = language;
    localStorage.setItem("el-mister-language", language);
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: TranslationKey) => dictionary[language][key], isRtl: language === "ar" }), [language]);
  return <LanguageContext.Provider value={value}>{children}<LegacyTextLocalization /></LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
