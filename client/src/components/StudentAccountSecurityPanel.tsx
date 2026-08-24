import { Clock3, MonitorSmartphone, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

export function StudentAccountSecurityPanel({ onBack }: { onBack: () => void }) {
  const security = trpc.studentAuth.security.list.useQuery(undefined, { retry: false });
  const endDevice = trpc.studentAuth.security.revoke.useMutation({ onSuccess: () => { security.refetch(); toast.success("تم إنهاء جلسة الجهاز."); }, onError: error => toast.error(error.message) });
  const endOthers = trpc.studentAuth.security.revokeOthers.useMutation({ onSuccess: () => { security.refetch(); toast.success("تم إنهاء كل الجلسات الأخرى."); }, onError: error => toast.error(error.message) });
  const data = security.data;
  const otherDevices = data?.sessions.filter(session => session.id !== data.currentSessionId) || [];

  return <main className="student-portal" dir="rtl"><section className="student-dashboard"><header className="student-profile-head"><div><span className="student-kicker">أمان الحساب</span><h1>الأجهزة المتصلة</h1><p>راجع الجلسات المتصلة بحسابك وأنهِ أي جهاز لا تعرفه.</p></div><button type="button" className="student-back" onClick={onBack}>عودة للبروفايل</button></header>{security.isLoading ? <section className="student-panel">جارٍ تحميل جلسات الأجهزة...</section> : security.error ? <section className="student-panel"><div className="account-security-empty"><ShieldCheck size={22}/><div><b>تعذر تحميل الأجهزة</b><p>أعد تسجيل الدخول ثم حاول مرة أخرى.</p></div></div></section> : <section className="account-security-panel student-panel"><div className="account-security-head"><div><span className="student-kicker">أمان الملف الشخصي</span><h3>آخر دخول: {formatDate(data?.lastSignedIn)}</h3></div><div className="account-security-icon"><ShieldCheck size={21}/></div></div><div className="account-security-summary"><Clock3 size={15}/><span>{data?.sessions.length || 0} جلسة نشطة محفوظة بأمان.</span></div>{otherDevices.length > 0 && <button type="button" className="student-primary account-security-end-others" disabled={endOthers.isPending} onClick={() => endOthers.mutate()}><XCircle size={15}/> إنهاء الجلسات الأخرى</button>}<div className="account-security-list">{data?.sessions.length ? data.sessions.map(session => { const current = session.id === data.currentSessionId; return <article key={session.id} className={current ? "current" : ""}><span className="account-security-device"><MonitorSmartphone size={18}/></span><div><b>{session.deviceName}{current ? " · هذا الجهاز" : ""}</b><small>آخر نشاط: {formatDate(session.lastSeenAt)}</small></div>{current ? <span className="account-security-current">نشط الآن</span> : <button type="button" className="student-back" disabled={endDevice.isPending} onClick={() => endDevice.mutate({ sessionId: session.id })}>إنهاء</button>}</article>; }) : <div className="account-security-empty"><MonitorSmartphone size={22}/><div><b>لا توجد جلسات حديثة بعد</b><p>ستظهر الأجهزة بعد أول دخول جديد إلى الحساب.</p></div></div>}</div></section>}</section></main>;
}
