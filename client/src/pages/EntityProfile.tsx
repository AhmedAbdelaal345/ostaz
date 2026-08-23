import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardList, Pencil, Save, Users, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "../const";

const date = (value: Date | string | null | undefined) => value ? new Date(value).toLocaleDateString("ar-EG") : "—";

function ProfileShell({ title, subtitle, backTo, children }: { title: string; subtitle: string; backTo: string; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  return <main className="entity-profile" dir="rtl"><div className="entity-profile-wrap"><header className="entity-profile-head"><button type="button" onClick={() => setLocation(backTo)}><ArrowRight size={17}/> رجوع</button><div><span>ملف تشغيلي</span><h1>{title}</h1><p>{subtitle}</p></div></header>{children}</div></main>;
}

function StudentAcademicCard({ student }: { student: any }) {
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [age, setAge] = useState(student.age ? String(student.age) : "");
  const [grade, setGrade] = useState(student.grade || "");
  const update = trpc.app.students.update.useMutation({
    onSuccess: async () => { await Promise.all([utils.app.students.detail.invalidate({ id: student.id }), utils.app.bootstrap.invalidate()]); setEditing(false); toast.success("تم تحديث العمر والصف الدراسي"); },
    onError: error => toast.error(error.message || "تعذر حفظ بيانات الطالب"),
  });
  const save = () => update.mutate({ id: student.id, data: { age: age ? Number(age) : null, grade: grade.trim() || null } });
  return <article className="student-academic-card"><div className="student-academic-title"><h2><BookOpen size={18}/> البيانات الدراسية</h2><button type="button" className="entity-edit-button" onClick={() => setEditing(open => !open)}>{editing ? <><X size={15}/> إلغاء</> : <><Pencil size={15}/> تعديل</>}</button></div>{editing ? <div className="entity-academic-form"><label>العمر<input inputMode="numeric" value={age} onChange={event => setAge(event.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="مثال: 15"/></label><label>الصف الدراسي<input value={grade} onChange={event => setGrade(event.target.value)} placeholder="مثال: الصف الثالث الإعدادي"/></label><button type="button" className="entity-save-button" disabled={update.isPending} onClick={save}><Save size={15}/>{update.isPending ? "جارٍ الحفظ..." : "حفظ البيانات"}</button></div> : <dl><div><dt>العمر</dt><dd>{student.age ? `${student.age} سنة` : "غير مضاف"}</dd></div><div><dt>الصف الدراسي</dt><dd>{student.grade || "غير مضاف"}</dd></div></dl>}</article>;
}

export default function EntityProfile() {
  const [location] = useLocation();
  const auth = useAuth();
  const studentMatch = location.match(/^\/students\/(\d+)$/);
  const groupMatch = location.match(/^\/groups\/(\d+)$/);
  const studentId = Number(studentMatch?.[1] || 0);
  const groupId = Number(groupMatch?.[1] || 0);
  const student = trpc.app.students.detail.useQuery({ id: studentId }, { enabled: auth.isAuthenticated && Boolean(studentId) });
  const group = trpc.app.groups.detail.useQuery({ id: groupId }, { enabled: auth.isAuthenticated && Boolean(groupId) });

  if (auth.loading) return <main className="entity-profile loading">جارٍ تجهيز البروفايل...</main>;
  if (!auth.isAuthenticated) return <main className="entity-profile auth-gate"><section><h1>بروفايل خاص بالمعلم</h1><p>سجّل الدخول للوصول إلى البيانات المعزولة لطلابك ومجموعاتك.</p><button type="button" onClick={() => startLogin()}>تسجيل الدخول</button></section></main>;

  if (studentId) {
    if (student.isLoading) return <main className="entity-profile loading">جارٍ تحميل ملف الطالب...</main>;
    if (!student.data) return <ProfileShell title="الطالب غير موجود" subtitle="تأكد من رابط البروفايل." backTo="/groups"><p className="entity-empty">لا يمكن العثور على هذا الطالب ضمن حسابك.</p></ProfileShell>;
    const detail = student.data;
    const paid = detail.transactions.filter((row: any) => row.kind === "subscription" && Boolean(row.paidAt)).reduce((sum: number, row: any) => sum + Number(row.amount), 0);
    const attendanceRate = detail.attendance.length ? Math.round((detail.attendance.filter((row: any) => row.status !== "absent").length / detail.attendance.length) * 100) : 0;
    return <ProfileShell title={detail.student.name} subtitle={`${detail.group?.name || "دون مجموعة"} · كود الطالب: ${detail.student.studentCode || `ST-${detail.student.id}`}`} backTo="/groups"><section className="entity-summary"><article><CheckCircle2/><span>نسبة الحضور</span><b>{attendanceRate}%</b></article><article><CircleDollarSign/><span>المحصّل</span><b>{paid} ج.م</b></article><article><ClipboardList/><span>التقييمات</span><b>{detail.assessments.length}</b></article></section><section className="entity-detail-grid"><article><h2><Users size={18}/> بيانات التواصل</h2><dl><div><dt>هاتف الطالب</dt><dd>{detail.student.phone || "غير مسجل"}</dd></div><div><dt>ولي الأمر</dt><dd>{detail.student.guardianName || "غير مسجل"}</dd></div><div><dt>هاتف ولي الأمر</dt><dd>{detail.student.guardianPhone || "غير مسجل"}</dd></div><div><dt>المجموعة</dt><dd>{detail.group?.name || "غير محددة"}</dd></div></dl></article><StudentAcademicCard student={detail.student}/><article><h2><CalendarDays size={18}/> آخر الحضور</h2><div className="entity-row-list">{detail.attendance.length ? detail.attendance.slice(0, 6).map((row: any) => <div key={row.id}><span>{date(row.lessonDate)}</span><b className={`attendance-${row.status}`}>{row.status === "present" ? "حاضر" : row.status === "late" ? "متأخر" : "غائب"}</b></div>) : <p>لا توجد سجلات حضور بعد.</p>}</div></article><article><h2><BookOpen size={18}/> التقييمات</h2><div className="entity-row-list">{detail.assessments.length ? detail.assessments.slice(0, 6).map((row: any) => <div key={row.id}><span>{row.title} · {row.period}</span><b>{row.score ?? "—"}/{row.maxScore ?? "—"}</b></div>) : <p>لا توجد تقييمات بعد.</p>}</div></article><article><h2><CircleDollarSign size={18}/> السجل المالي</h2><div className="entity-row-list">{detail.transactions.length ? detail.transactions.slice(0, 6).map((row: any) => <div key={row.id}><span>{row.description || "اشتراك"} · {date(row.dueDate)}</span><b className={row.paidAt ? "money-paid" : "money-due"}>{row.paidAt ? "تم السداد" : "مستحق"}</b></div>) : <p>لا توجد عمليات مالية بعد.</p>}</div></article><article className="wide"><h2><ClipboardList size={18}/> سجل السلوك</h2><div className="entity-row-list">{detail.behavior.length ? detail.behavior.slice(0, 6).map((row: any) => <div key={row.id}><span>{row.title}{row.note ? ` · ${row.note}` : ""}</span><b className={`behavior-${row.category}`}>{row.points > 0 ? `+${row.points}` : row.points}</b></div>) : <p>لا توجد ملاحظات سلوكية بعد.</p>}</div></article></section></ProfileShell>;
  }

  if (groupId) {
    if (group.isLoading) return <main className="entity-profile loading">جارٍ تحميل ملف المجموعة...</main>;
    if (!group.data) return <ProfileShell title="المجموعة غير موجودة" subtitle="تأكد من رابط البروفايل." backTo="/groups"><p className="entity-empty">لا يمكن العثور على هذه المجموعة ضمن حسابك.</p></ProfileShell>;
    const detail = group.data;
    const collected = detail.transactions.filter((row: any) => row.kind === "subscription" && row.paidAt).reduce((sum: number, row: any) => sum + Number(row.amount), 0);
    const absences = detail.attendance.filter((row: any) => row.status === "absent").length;
    return <ProfileShell title={detail.group.name} subtitle={`${detail.group.place} · ${detail.group.mode} · ${detail.group.day} ${detail.group.time}`} backTo="/groups"><section className="entity-summary"><article><Users/><span>الطلاب</span><b>{detail.students.length}</b></article><article><CircleDollarSign/><span>المحصّل</span><b>{collected} ج.م</b></article><article><CheckCircle2/><span>الغياب المسجل</span><b>{absences}</b></article></section><section className="entity-detail-grid"><article><h2><Users size={18}/> طلاب المجموعة</h2><div className="entity-row-list">{detail.students.length ? detail.students.map((row: any) => <a key={row.id} href={`/students/${row.id}`}><span>{row.name}<small>{row.studentCode || `ST-${row.id}`}</small></span><b>{row.phone || "—"}</b></a>) : <p>لا يوجد طلاب مرتبطون بعد.</p>}</div></article><article><h2><CalendarDays size={18}/> الجدول والتحصيل</h2><dl><div><dt>الموعد</dt><dd>{detail.group.day} · {detail.group.time}</dd></div><div><dt>رسوم الطالب</dt><dd>{detail.group.fee} ج.م</dd></div><div><dt>عدد التقييمات</dt><dd>{detail.assessments.length}</dd></div><div><dt>عمليات مالية</dt><dd>{detail.transactions.length}</dd></div></dl></article><article><h2><CheckCircle2 size={18}/> آخر سجلات الحضور</h2><div className="entity-row-list">{detail.attendance.length ? detail.attendance.slice(0, 8).map((row: any) => <div key={row.id}><span>{date(row.lessonDate)}</span><b className={`attendance-${row.status}`}>{row.status === "present" ? "حاضر" : row.status === "late" ? "متأخر" : "غائب"}</b></div>) : <p>لا توجد سجلات حضور بعد.</p>}</div></article><article><h2><BookOpen size={18}/> آخر التقييمات</h2><div className="entity-row-list">{detail.assessments.length ? detail.assessments.slice(0, 8).map((row: any) => <div key={row.id}><span>{row.title}</span><b>{row.score ?? "—"}/{row.maxScore ?? "—"}</b></div>) : <p>لا توجد تقييمات بعد.</p>}</div></article></section></ProfileShell>;
  }
  return <main className="entity-profile loading">الرابط غير صالح.</main>;
}
