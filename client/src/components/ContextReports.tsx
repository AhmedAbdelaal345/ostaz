import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, CircleDollarSign, Users, WalletCards } from "lucide-react";
import { calculateContextReport, type ContextId } from "../../../shared/contextReport";
import { useLanguage } from "@/contexts/LanguageContext";

const contexts: Array<{ id: ContextId; label: string; place: string }> = [
  { id: "school", label: "المدرسة", place: "مدرسة" },
  { id: "center", label: "السنتر", place: "سنتر" },
  { id: "online", label: "أونلاين", place: "أونلاين" },
];

export function ContextReports({ groups, students, attendanceRows }: { groups: any[]; students: any[]; attendanceRows: any[] }) {
  const { language } = useLanguage();
  const [contextId, setContextId] = useState<ContextId>("center");
  const context = contexts.find(item => item.id === contextId)!;
  const report = useMemo(() => calculateContextReport({ groups, students, attendanceRows, contextId }), [attendanceRows, contextId, groups, students]);
  const label = (id: ContextId) => language === "ar" ? contexts.find(item => item.id === id)!.label : id === "school" ? "School" : id === "center" ? "Center" : "Online";
  return <section className="context-reports">
    <div className="context-report-heading"><div><span className="eyebrow">{language === "ar" ? "قراءة تشغيل مستقلة" : "Separate operational view"}</span><h2>{language === "ar" ? "تقارير السياقات" : "Context reports"}</h2><p>{language === "ar" ? "تابع أداء المدرسة والسنتر والأونلاين دون خلط الأرقام." : "Follow school, center, and online performance without mixing the numbers."}</p></div><button className="secondary" type="button" onClick={() => window.print()}>{language === "ar" ? "طباعة التقرير" : "Print report"}</button></div>
    <div className="context-report-tabs" role="tablist">{contexts.map(item => <button type="button" role="tab" aria-selected={contextId === item.id} className={contextId === item.id ? "active" : ""} key={item.id} onClick={() => setContextId(item.id)}>{label(item.id)}</button>)}</div>
    <div className="context-report-banner"><span>{label(context.id)}</span><b>{language === "ar" ? "ملخص اليوم التشغيلي" : "Operating day summary"}</b><small>{report.scopeGroups.length} {language === "ar" ? "مجموعة" : "groups"} · {report.scopeStudents.length} {language === "ar" ? "طالب" : "students"}</small></div>
    <div className="context-report-stats">
      <article><span className="report-icon blue"><Users size={18}/></span><small>{language === "ar" ? "الطلاب المسجلون" : "Enrolled students"}</small><strong>{report.scopeStudents.length}</strong><em>{report.scopeGroups.length} {language === "ar" ? "مجموعة نشطة" : "active groups"}</em></article>
      <article><span className="report-icon green"><CheckCircle2 size={18}/></span><small>{language === "ar" ? "حضور اليوم" : "Today's attendance"}</small><strong>{report.attendanceRate === null ? "—" : `${report.attendanceRate}%`}</strong><em>{report.rows.length ? `${report.rows.length} ${language === "ar" ? "تسجيل حضور" : "attendance records"}` : (language === "ar" ? "لم تُسجّل حصة بعد" : "No lesson recorded yet")}</em></article>
      <article><span className="report-icon gold"><CircleDollarSign size={18}/></span><small>{language === "ar" ? "المحصل" : "Collected"}</small><strong>{report.collected.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}</strong><em>{language === "ar" ? "من" : "of"} {report.expected.toLocaleString()} {language === "ar" ? "ج.م متوقعة" : "EGP expected"}</em></article>
      <article><span className="report-icon red"><WalletCards size={18}/></span><small>{language === "ar" ? "المتبقي" : "Outstanding"}</small><strong>{report.remaining.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}</strong><em>{language === "ar" ? "يحتاج متابعة" : "Needs follow-up"}</em></article>
    </div>
    <div className="context-report-details panel"><div className="report-list-heading"><div><BarChart3 size={18}/><h3>{language === "ar" ? "تفصيل المجموعات" : "Group breakdown"}</h3></div><span>{label(context.id)}</span></div>{report.scopeGroups.length ? report.scopeGroups.map(group => { const groupStudents = report.scopeStudents.filter(student => student.group === group.name); const groupCollected = groupStudents.reduce((sum, student) => sum + Number(student.paidAmount || 0), 0); const groupExpected = groupStudents.length * Number(group.fee || 0); return <div className="context-group-row" key={group.id}><div><b>{group.name}</b><small>{groupStudents.length} {language === "ar" ? "طالب" : "students"} · {group.mode}</small></div><span>{groupCollected.toLocaleString()} / {groupExpected.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}</span><strong>{groupExpected ? `${Math.round((groupCollected / groupExpected) * 100)}%` : "—"}</strong></div>; }) : <div className="context-report-empty">{language === "ar" ? `لا توجد مجموعات ضمن سياق ${label(context.id)} بعد.` : `No groups are available in the ${label(context.id)} context yet.`}</div>}</div>
  </section>;
}
