import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, CircleDollarSign, Users, WalletCards } from "lucide-react";
import { calculateContextReport, type ContextId } from "../../../shared/contextReport";

const contexts: Array<{ id: ContextId; label: string; place: string }> = [
  { id: "school", label: "المدرسة", place: "مدرسة" },
  { id: "center", label: "السنتر", place: "سنتر" },
  { id: "online", label: "أونلاين", place: "أونلاين" },
];

export function ContextReports({ groups, students, attendanceRows }: { groups: any[]; students: any[]; attendanceRows: any[] }) {
  const [contextId, setContextId] = useState<ContextId>("center");
  const context = contexts.find(item => item.id === contextId)!;
  const report = useMemo(() => calculateContextReport({ groups, students, attendanceRows, contextId }), [attendanceRows, contextId, groups, students]);
  return <section className="context-reports">
    <div className="context-report-heading"><div><span className="eyebrow">قراءة تشغيل مستقلة</span><h2>تقارير السياقات</h2><p>تابع أداء المدرسة والسنتر والأونلاين دون خلط الأرقام.</p></div><button className="secondary" type="button" onClick={() => window.print()}>طباعة التقرير</button></div>
    <div className="context-report-tabs" role="tablist">{contexts.map(item => <button type="button" role="tab" aria-selected={contextId === item.id} className={contextId === item.id ? "active" : ""} key={item.id} onClick={() => setContextId(item.id)}>{item.label}</button>)}</div>
    <div className="context-report-banner"><span>{context.label}</span><b>ملخص اليوم التشغيلي</b><small>{report.scopeGroups.length} مجموعة · {report.scopeStudents.length} طالب</small></div>
    <div className="context-report-stats">
      <article><span className="report-icon blue"><Users size={18}/></span><small>الطلاب المسجلون</small><strong>{report.scopeStudents.length}</strong><em>{report.scopeGroups.length} مجموعة نشطة</em></article>
      <article><span className="report-icon green"><CheckCircle2 size={18}/></span><small>حضور اليوم</small><strong>{report.attendanceRate === null ? "—" : `${report.attendanceRate}%`}</strong><em>{report.rows.length ? `${report.rows.length} تسجيل حضور` : "لم تُسجّل حصة بعد"}</em></article>
      <article><span className="report-icon gold"><CircleDollarSign size={18}/></span><small>المحصل</small><strong>{report.collected.toLocaleString()} ج.م</strong><em>من {report.expected.toLocaleString()} ج.م متوقعة</em></article>
      <article><span className="report-icon red"><WalletCards size={18}/></span><small>المتبقي</small><strong>{report.remaining.toLocaleString()} ج.م</strong><em>يحتاج متابعة</em></article>
    </div>
    <div className="context-report-details panel"><div className="report-list-heading"><div><BarChart3 size={18}/><h3>تفصيل المجموعات</h3></div><span>{context.label}</span></div>{report.scopeGroups.length ? report.scopeGroups.map(group => { const groupStudents = report.scopeStudents.filter(student => student.group === group.name); const groupCollected = groupStudents.reduce((sum, student) => sum + Number(student.paidAmount || 0), 0); const groupExpected = groupStudents.length * Number(group.fee || 0); return <div className="context-group-row" key={group.id}><div><b>{group.name}</b><small>{groupStudents.length} طالب · {group.mode}</small></div><span>{groupCollected.toLocaleString()} / {groupExpected.toLocaleString()} ج.م</span><strong>{groupExpected ? `${Math.round((groupCollected / groupExpected) * 100)}%` : "—"}</strong></div>; }) : <div className="context-report-empty">لا توجد مجموعات ضمن سياق {context.label} بعد.</div>}</div>
  </section>;
}
