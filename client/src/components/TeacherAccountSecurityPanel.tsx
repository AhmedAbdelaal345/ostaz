import { Clock3, MonitorSmartphone, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

function formatDate(value?: Date | string | null, language = "ar") {
  if (!value) return "—";
  return new Date(value).toLocaleString(language === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export function TeacherAccountSecurityPanel() {
  const { language } = useLanguage();
  const security = trpc.teacherAuth.security.list.useQuery(undefined, { retry: false });
  const endDevice = trpc.teacherAuth.security.revoke.useMutation({
    onSuccess: () => { security.refetch(); toast.success(language === "ar" ? "تم إنهاء جلسة الجهاز." : "Device session ended."); },
    onError: error => toast.error(error.message),
  });
  const endOthers = trpc.teacherAuth.security.revokeOthers.useMutation({
    onSuccess: () => { security.refetch(); toast.success(language === "ar" ? "تم إنهاء كل الجلسات الأخرى." : "All other sessions ended."); },
    onError: error => toast.error(error.message),
  });
  const data = security.data;
  const otherDevices = data?.sessions.filter(session => session.id !== data.currentSessionId) || [];

  if (security.isLoading) return <div className="account-security-panel panel"><span className="eyebrow">{language === "ar" ? "أمان الحساب" : "Account security"}</span><p>{language === "ar" ? "جارٍ تحميل الأجهزة المتصلة..." : "Loading connected devices..."}</p></div>;
  if (security.error) return <div className="account-security-panel panel account-security-empty"><ShieldCheck size={22}/><div><b>{language === "ar" ? "فعّل دخول الهاتف أولًا" : "Enable phone sign-in first"}</b><p>{language === "ar" ? "بعد تفعيل رقم الهاتف وكلمة المرور من ملفك ستظهر هنا جلسات أجهزتك." : "After enabling a phone number and password from your profile, your device sessions will appear here."}</p></div></div>;

  return <section className="account-security-panel panel" aria-label={language === "ar" ? "أمان الحساب" : "Account security"}><div className="account-security-head"><div><span className="eyebrow">{language === "ar" ? "أمان الملف الشخصي" : "Profile security"}</span><h3>{language === "ar" ? "الأجهزة المتصلة" : "Connected devices"}</h3><p>{language === "ar" ? "آخر دخول:" : "Last sign-in:"} <b>{formatDate(data?.lastSignedIn, language)}</b></p></div><div className="account-security-icon"><ShieldCheck size={21}/></div></div><div className="account-security-summary"><Clock3 size={15}/><span>{data?.sessions.length || 0} {language === "ar" ? "جلسة نشطة محفوظة بأمان." : "active sessions securely stored."}</span></div>{otherDevices.length > 0 && <button type="button" className="secondary account-security-end-others" disabled={endOthers.isPending} onClick={() => endOthers.mutate()}><XCircle size={15}/>{language === "ar" ? "إنهاء الجلسات الأخرى" : "End other sessions"}</button>}<div className="account-security-list">{data?.sessions.length ? data.sessions.map(session => { const current = session.id === data.currentSessionId; return <article key={session.id} className={current ? "current" : ""}><span className="account-security-device"><MonitorSmartphone size={18}/></span><div><b>{session.deviceName}{current ? (language === "ar" ? " · هذا الجهاز" : " · This device") : ""}</b><small>{language === "ar" ? "آخر نشاط:" : "Last activity:"} {formatDate(session.lastSeenAt, language)}</small></div>{current ? <span className="account-security-current">{language === "ar" ? "نشط الآن" : "Active now"}</span> : <button type="button" className="secondary compact" disabled={endDevice.isPending} onClick={() => endDevice.mutate({ sessionId: session.id })}>{language === "ar" ? "إنهاء" : "End"}</button>}</article>; }) : <div className="account-security-empty"><MonitorSmartphone size={22}/><div><b>{language === "ar" ? "لا توجد جلسات حديثة بعد" : "No recent sessions yet"}</b><p>{language === "ar" ? "ستظهر الأجهزة بعد أول دخول جديد إلى الحساب." : "Devices will appear after the next account sign-in."}</p></div></div>}</div></section>;
}
