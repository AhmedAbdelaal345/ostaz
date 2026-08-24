import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardCheck, Plus, Save, UserPlus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { YEAR_WORK_FIELDS, calculateEffectiveYearWorkMonth, calculateYearWorkTermAverage, clampYearWorkMark, type YearWorkField, type YearWorkMarks } from "../../../shared/yearWork";

type Student = { id: number; name: string; grade?: string | null; group?: string };
type ScoreDraft = Record<YearWorkField, number> & { monthlyExam: number };

const dateInputValue = (value: Date | string) => new Date(value).toISOString().slice(0, 10);
const monthLabel = (monthKey: string, language: "ar" | "en" = "ar") => new Date(`${monthKey}-01T12:00:00`).toLocaleDateString(language === "ar" ? "ar-EG" : "en-GB", { month: "long", year: "numeric" });
const monthRange = (start: string, end: string) => {
  if (!start || !end || start > end) return [];
  const months: string[] = [];
  const cursor = new Date(`${start.slice(0, 7)}-01T12:00:00`);
  const last = new Date(`${end.slice(0, 7)}-01T12:00:00`);
  while (cursor <= last && months.length < 8) { months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`); cursor.setMonth(cursor.getMonth() + 1); }
  return months;
};
const emptyScore = (): ScoreDraft => ({ homeWork: 0, activity: 0, weeklyEvaluation: 0, performanceTasks: 0, behavior: 0, attendance: 0, monthlyExam: 0 });

export function YearWorkAssistant({ students }: { students: Student[] }) {
  const { language, isRtl } = useLanguage();
  const [activeTermId, setActiveTermId] = useState<number>();
  const [createNew, setCreateNew] = useState(false);
  const workspaceInput = useMemo(() => activeTermId ? { termId: activeTermId } : undefined, [activeTermId]);
  const workspace = trpc.app.yearWork.get.useQuery(workspaceInput, { retry: false });
  const saveTerm = trpc.app.yearWork.saveTerm.useMutation({ onError: error => toast.error(error.message || "تعذر حفظ إعدادات أعمال السنة") });
  const saveScore = trpc.app.yearWork.saveScore.useMutation({ onSuccess: () => workspace.refetch(), onError: error => toast.error(error.message || "تعذر حفظ الدرجة") });
  const markAttendance = trpc.app.attendance.mark.useMutation({ onSuccess: () => { workspace.refetch(); toast.success("تم حفظ الحضور اليومي"); }, onError: error => toast.error(error.message || "تعذر حفظ الحضور") });
  const today = dateInputValue(new Date());
  const [term, setTerm] = useState<"first" | "second">("first");
  const [grade, setGrade] = useState("");
  const [startsAt, setStartsAt] = useState(today);
  const [endsAt, setEndsAt] = useState(today);
  const [studentIds, setStudentIds] = useState<number[]>([]);
  const [activeMonth, setActiveMonth] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [drafts, setDrafts] = useState<Record<string, ScoreDraft>>({});
  const terms = workspace.data?.terms || [];
  const activeTerm = createNew ? undefined : (terms.find(item => item.id === activeTermId) || terms[0]);
  const months = activeTerm ? JSON.parse(activeTerm.monthsJson) as string[] : monthRange(startsAt, endsAt);
  const selectedIds = activeTerm ? JSON.parse(activeTerm.studentIdsJson) as number[] : studentIds;
  const roster = students.filter(student => selectedIds.includes(student.id));
  const gradeMatchedStudents = students.filter(student => !grade || student.grade === grade);
  const availableStudents = gradeMatchedStudents.length ? gradeMatchedStudents : students;
  const scores = workspace.data?.scores || [];
  const attendanceRows = workspace.data?.attendance || [];

  useEffect(() => { if (!createNew && !activeTermId && terms[0]) setActiveTermId(terms[0].id); }, [activeTermId, createNew, terms]);
  useEffect(() => { if (!activeTerm) return; setTerm(activeTerm.term); setGrade(activeTerm.grade); setStartsAt(dateInputValue(activeTerm.startsAt)); setEndsAt(dateInputValue(activeTerm.endsAt)); setStudentIds(JSON.parse(activeTerm.studentIdsJson)); }, [activeTerm?.id]);
  useEffect(() => { if (months.length && !months.includes(activeMonth)) setActiveMonth(months[0]); }, [months.join("|"), activeMonth]);
  useEffect(() => { if (!activeTerm && grade) setStudentIds(availableStudents.map(student => student.id)); }, [grade, activeTerm?.id, availableStudents.map(student => student.id).join(",")]);

  const scoreFor = (studentId: number, monthKey: string): ScoreDraft => {
    const draftKey = `${studentId}-${monthKey}`;
    if (drafts[draftKey]) return drafts[draftKey];
    const saved = scores.find(score => score.studentId === studentId && score.monthKey === monthKey);
    return saved ? { homeWork: saved.homeWork, activity: saved.activity, weeklyEvaluation: saved.weeklyEvaluation, performanceTasks: saved.performanceTasks, behavior: saved.behavior, attendance: saved.attendance, monthlyExam: saved.monthlyExam } : emptyScore();
  };
  const updateMark = (studentId: number, field: keyof ScoreDraft, value: string) => { if (!activeMonth) return; const key = `${studentId}-${activeMonth}`; const max = field === "monthlyExam" ? 100 : 5; const next = Math.min(max, Math.max(0, Number(value) || 0)); setDrafts(current => ({ ...current, [key]: { ...scoreFor(studentId, activeMonth), [field]: field === "monthlyExam" ? Math.round(next) : clampYearWorkMark(next) } })); };
  const toggleStudent = (studentId: number) => setStudentIds(current => current.includes(studentId) ? current.filter(id => id !== studentId) : [...current, studentId]);
  const saveTermSettings = async () => { const calculatedMonths = monthRange(startsAt, endsAt); if (!grade.trim() || !calculatedMonths.length) return toast.error("حدد الصف وتاريخ بداية ونهاية الترم بشكل صحيح"); if (!studentIds.length) return toast.error("أضف طالبًا واحدًا على الأقل إلى كشف أعمال السنة"); const result = await saveTerm.mutateAsync({ id: activeTerm?.id, term, grade: grade.trim(), startsAt: new Date(`${startsAt}T12:00:00`), endsAt: new Date(`${endsAt}T12:00:00`), months: calculatedMonths, studentIds }); setCreateNew(false); setActiveTermId(result.id); toast.success("تم حفظ إعدادات أعمال السنة ومزامنتها"); };
  const termAverage = (studentId: number) => calculateYearWorkTermAverage(months.map(month => calculateEffectiveYearWorkMonth(scoreFor(studentId, month), attendanceRows, studentId, month).total));
  const markedStatus = (studentId: number) => attendanceRows.find(row => row.studentId === studentId && dateInputValue(row.lessonDate) === attendanceDate)?.status;

  return <section className="year-work" dir={isRtl ? "rtl" : "ltr"}><header className="year-work-head"><div><span className="eyebrow">مساعد أعمال السنة</span><h2>كشف درجات الترم والمتابعة اليومية</h2><p>كل بند من بنود أعمال السنة من 5 درجات، ومجموع الشهر يُحسب تلقائيًا من 30. الاختبار الشهري محفوظ مستقلًا.</p></div><div className="year-work-term-picker">{terms.length > 0 && <select value={activeTerm?.id || ""} onChange={event => { setCreateNew(false); setActiveTermId(Number(event.target.value)); setDrafts({}); }}><option value="">اختر كشف الترم</option>{terms.map(item => <option key={item.id} value={item.id}>{item.term === "first" ? "الفصل الأول" : "الفصل الثاني"} · {item.grade}</option>)}</select>}<button type="button" className="secondary" onClick={() => { setCreateNew(true); setActiveTermId(undefined); setGrade(""); setStudentIds([]); setDrafts({}); }}>كشف جديد</button></div></header>
    <section className="panel year-work-settings"><div className="school-section-head"><div><span className="eyebrow">إعداد كشف الترم</span><h3>{activeTerm ? "تعديل إعدادات الفصل الدراسي" : "ابدأ بإعداد الفصل الدراسي"}</h3></div><button className="primary" type="button" onClick={saveTermSettings} disabled={saveTerm.isPending}><Save size={16}/>{saveTerm.isPending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}</button></div><div className="year-work-settings-grid"><label>الفصل الدراسي<select value={term} onChange={event => setTerm(event.target.value as typeof term)}><option value="first">الفصل الدراسي الأول</option><option value="second">الفصل الدراسي الثاني</option></select></label><label>الصف الدراسي<input value={grade} onChange={event => setGrade(event.target.value)} placeholder="مثال: الصف الثالث الإعدادي"/></label><label>تاريخ بداية الترم<input type="date" value={startsAt} onChange={event => setStartsAt(event.target.value)}/></label><label>تاريخ نهاية الترم<input type="date" value={endsAt} min={startsAt} onChange={event => setEndsAt(event.target.value)}/></label></div><div className="year-work-months"><b>شهور الترم</b>{monthRange(startsAt, endsAt).length ? monthRange(startsAt, endsAt).map(month => <span key={month}><CalendarDays size={14}/>{monthLabel(month, language)}</span>) : <small>اختر تاريخي البداية والنهاية لإظهار الشهور تلقائيًا.</small>}</div><div className="year-work-roster-picker"><div><b>أسماء الطلاب في الكشف</b><small>اختر من الطلاب المسجلين في الصف المحدد. يمكنك تعديل القائمة في أي وقت.</small></div>{availableStudents.length ? <div className="year-work-student-checks">{availableStudents.map(student => <button type="button" key={student.id} className={studentIds.includes(student.id) ? "selected" : ""} onClick={() => toggleStudent(student.id)}><UserPlus size={14}/>{student.name}</button>)}</div> : <div className="year-work-empty">لا توجد أسماء طلاب مسجلة لهذا الصف. أضف الطالب أولًا من قائمة الطلاب مع تحديد الصف الدراسي.</div>}</div></section>
    {activeTerm && roster.length > 0 && activeMonth ? <><section className="panel year-work-attendance"><div><span className="eyebrow">غياب يومي</span><h3>تسجيل حضور وغياب الطلاب</h3><p>يُراجع النظام الغياب المسجل: الغياب طوال أسبوع أو شهر كامل يجعل مجموع أعمال السنة للشهر صفرًا تلقائيًا.</p></div><label>التاريخ<input type="date" value={attendanceDate} min={dateInputValue(activeTerm.startsAt)} max={dateInputValue(activeTerm.endsAt)} onChange={event => setAttendanceDate(event.target.value)}/></label><div className="year-work-attendance-list">{roster.map(student => <article key={student.id}><b>{student.name}</b><div><button type="button" className={markedStatus(student.id) === "present" ? "present" : ""} onClick={() => markAttendance.mutate({ studentId: student.id, lessonDate: new Date(`${attendanceDate}T12:00:00`), status: "present" })}>حاضر</button><button type="button" className={markedStatus(student.id) === "late" ? "late" : ""} onClick={() => markAttendance.mutate({ studentId: student.id, lessonDate: new Date(`${attendanceDate}T12:00:00`), status: "late" })}>متأخر</button><button type="button" className={markedStatus(student.id) === "absent" ? "absent" : ""} onClick={() => markAttendance.mutate({ studentId: student.id, lessonDate: new Date(`${attendanceDate}T12:00:00`), status: "absent" })}>غائب</button></div></article>)}</div></section>
      <section className="year-work-score-card panel"><div className="school-section-head"><div><span className="eyebrow">رصد الدرجات</span><h3>أعمال سنة {monthLabel(activeMonth, language)}</h3></div><div className="year-work-month-tabs">{months.map(month => <button type="button" key={month} className={activeMonth === month ? "selected" : ""} onClick={() => setActiveMonth(month)}>{monthLabel(month, language)}</button>)}</div></div><p className="year-work-score-note">مجموع أعمال السنة من <b>30</b>. الاختبار الشهري منفصل ولا يدخل في هذا المجموع.</p><div className="year-work-score-table"><div className="year-work-score-head"><span>الطالب</span>{YEAR_WORK_FIELDS.map(field => <span key={field.key}>{field.label}<small>/5</small></span>)}<span>المجموع</span><span>اختبار شهري</span><span>المتوسط</span><span/></div>{roster.map(student => { const marks = scoreFor(student.id, activeMonth); const effective = calculateEffectiveYearWorkMonth(marks, attendanceRows, student.id, activeMonth); return <div className="year-work-score-row" key={student.id}><div><b>{student.name}</b><small>{student.grade || activeTerm.grade}</small></div>{YEAR_WORK_FIELDS.map(field => <label key={field.key}><input aria-label={`${field.label} ${student.name}`} type="number" min="0" max="5" value={marks[field.key]} disabled={Boolean(effective.automaticZero)} onChange={event => updateMark(student.id, field.key, event.target.value)}/></label>)}<strong className={effective.automaticZero ? "automatic-zero" : ""}>{effective.total}/30<small>{effective.automaticZero || "محسوب تلقائيًا"}</small></strong><label><input aria-label={`الاختبار الشهري ${student.name}`} type="number" min="0" max="100" value={marks.monthlyExam} onChange={event => updateMark(student.id, "monthlyExam", event.target.value)}/></label><strong>{termAverage(student.id)}/30<small>متوسط الترم</small></strong><button className="icon-button" type="button" aria-label={`حفظ درجات ${student.name}`} disabled={saveScore.isPending} onClick={() => saveScore.mutate({ termId: activeTerm.id, studentId: student.id, monthKey: activeMonth, ...marks })}><ClipboardCheck size={17}/></button></div>; })}</div></section></> : activeTerm ? <div className="year-work-empty panel"><XCircle size={24}/><b>لا يوجد طلاب في هذا الكشف بعد</b><span>افتح إعدادات الفصل واختر أسماء الطلاب ثم احفظ.</span></div> : <div className="year-work-empty panel"><Plus size={24}/><b>ابدأ بإعداد كشف أعمال السنة</b><span>حدد الفصل والصف وتاريخ البداية والنهاية، ثم اختر أسماء الطلاب.</span></div>}</section>;
}
