import { Clock3, MonitorSmartphone, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

export function TeacherAccountSecurityPanel() {
  const security = trpc.teacherAuth.security.list.useQuery(undefined, { retry: false });
  const endDevice = trpc.teacherAuth.security.revoke.useMutation({
    onSuccess: () => { security.refetch(); toast.success("تم إنهاء جلسة الجهاز."); },
    onError: error => toast.error(error.message),
  });
  const endOthers = trpc.teacherAuth.security.revokeOthers.useMutation({
    onSuccess: () => { security.refetch(); toast.success("تم إنهاء كل الجلسات الأخرى."); },
    onError: error => toast.error(error.message),
  });
  const data = security.data;
  const otherDevices = data?.sessions.filter(session => session.id !== data.currentSessionId) || [];

  if (security.isLoading) return <div className="account-security-panel panel"><span className="eyebrow">أمان الحساب</span><p>جارٍ تحميل الأجهزة المتصلة...</p></div>;
  if (security.error) return <div className="account-security-panel panel account-security-empty"><ShieldCheck size={22}/><div><b>فعّل دخول الهاتف أولًا</b><p>بعد تفعيل رقم الهاتف وكلمة المرور من ملفك ستظهر هنا جلسات أجهزتك.</p></div></div>;

  return <section className="account-security-panel panel" aria-label="أمان الحساب"><div className="account-security-head"><div><span className="eyebrow">أمان الملف الشخصي</span><h3>الأجهزة المتصلة</h3><p>آخر دخول: <b>{formatDate(data?.lastSignedIn)}</b></p></div><div className="account-security-icon"><ShieldCheck size={21}/></div></div><div className="account-security-summary"><Clock3 size={15}/><span>{data?.sessions.length || 0} جلسة نشطة محفوظة بأمان.</span></div>{otherDevices.length > 0 && <button type="button" className="secondary account-security-end-others" disabled={endOthers.isPending} onClick={() => endOthers.mutate()}><XCircle size={15}/> إنهاء الجلسات الأخرى</button>}<div className="account-security-list">{data?.sessions.length ? data.sessions.map(session => { const current = session.id === data.currentSessionId; return <article key={session.id} className={current ? "current" : ""}><span className="account-security-device"><MonitorSmartphone size={18}/></span><div><b>{session.deviceName}{current ? " · هذا الجهاز" : ""}</b><small>آخر نشاط: {formatDate(session.lastSeenAt)}</small></div>{current ? <span className="account-security-current">نشط الآن</span> : <button type="button" className="secondary compact" disabled={endDevice.isPending} onClick={() => endDevice.mutate({ sessionId: session.id })}>إنهاء</button>}</article>; }) : <div className="account-security-empty"><MonitorSmartphone size={22}/><div><b>لا توجد جلسات حديثة بعد</b><p>ستظهر الأجهزة بعد أول دخول جديد إلى الحساب.</p></div></div>}</div></section>;
}
