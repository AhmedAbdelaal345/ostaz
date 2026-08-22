import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, CheckCircle2, Clock3, LockKeyhole, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type QuizQuestion = { id: string; text: string; points: number; options?: string[] };

export default function StudentPortal() {
  const [location, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | null>>({});
  const student = trpc.studentAuth.me.useQuery(undefined, { retry: false });
  const quizzes = trpc.studentQuiz.available.useQuery(undefined, { enabled: Boolean(student.data), retry: false });
  const register = trpc.studentAuth.register.useMutation({ onSuccess: () => { student.refetch(); setLocation("/student/profile"); toast.success("تم إنشاء حسابك وربطه بسجلك الدراسي"); }, onError: error => toast.error(error.message) });
  const login = trpc.studentAuth.login.useMutation({ onSuccess: () => { student.refetch(); setLocation("/student/profile"); toast.success("مرحبًا بك في بروفايل الطالب"); }, onError: error => toast.error(error.message) });
  const logout = trpc.studentAuth.logout.useMutation({ onSuccess: () => { student.refetch(); setLocation("/student/login"); } });
  const submit = trpc.studentQuiz.submit.useMutation({ onSuccess: data => { toast.success(data.needsManualGrading ? "تم تسليم الإجابات للمراجعة" : `تم رصد نتيجتك: ${data.score}/${data.maxScore}`); quizzes.refetch(); setSelectedQuiz(null); setAnswers({}); }, onError: error => toast.error(error.message) });
  const isRegister = location === "/student/register";
  const activeQuestions = useMemo(() => selectedQuiz ? (selectedQuiz.questions || []) as QuizQuestion[] : [], [selectedQuiz]);

  useEffect(() => { if (!student.isLoading && !student.data && location === "/student/profile") setLocation("/student/login"); }, [location, setLocation, student.data, student.isLoading]);

  const submitCredentials = () => {
    if (!phone.trim() || password.length < 8) return toast.error("اكتب رقم الهاتف وكلمة مرور من 8 أحرف على الأقل");
    (isRegister ? register : login).mutate({ phone, password });
  };

  if (selectedQuiz) {
    const startsAt = new Date(selectedQuiz.startsAt).getTime();
    const endsAt = new Date(selectedQuiz.endsAt).getTime();
    const now = Date.now();
    const open = now >= startsAt && now <= endsAt;
    return <main className="student-portal" dir="rtl"><section className="student-quiz-sheet"><button type="button" className="student-back" onClick={() => { setSelectedQuiz(null); setAnswers({}); }}>عودة إلى البروفايل</button><span className="student-kicker">اختبار المجموعة</span><h1>{selectedQuiz.title}</h1><p>{selectedQuiz.instructions || "أجب عن جميع الأسئلة ثم سلّم الاختبار قبل انتهاء الوقت."}</p><div className="quiz-time"><Clock3 size={17}/><span>{open ? `متاح حتى ${new Date(selectedQuiz.endsAt).toLocaleString("ar-EG")}` : now < startsAt ? `يفتح ${new Date(selectedQuiz.startsAt).toLocaleString("ar-EG")}` : "انتهى وقت الاختبار"}</span></div>{activeQuestions.map((question, index) => <article className="student-question" key={question.id}><b>{index + 1}. {question.text}</b><small>{question.points} درجة</small>{selectedQuiz.questionType === "mcq" && <div className="student-options">{question.options?.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} disabled={!open} checked={answers[question.id] === optionIndex} onChange={() => setAnswers(current => ({ ...current, [question.id]: optionIndex }))}/><span>{option}</span></label>)}</div>}{selectedQuiz.questionType === "true_false" && <div className="student-options two"><label><input type="radio" name={question.id} disabled={!open} checked={answers[question.id] === true} onChange={() => setAnswers(current => ({ ...current, [question.id]: true }))}/><span>صح</span></label><label><input type="radio" name={question.id} disabled={!open} checked={answers[question.id] === false} onChange={() => setAnswers(current => ({ ...current, [question.id]: false }))}/><span>خطأ</span></label></div>}{selectedQuiz.questionType === "essay" && <textarea disabled={!open} value={String(answers[question.id] || "")} onChange={event => setAnswers(current => ({ ...current, [question.id]: event.target.value }))} placeholder="اكتب إجابتك هنا"/>}</article>)}<button type="button" className="student-primary" disabled={!open || submit.isPending || Object.keys(answers).length < activeQuestions.length} onClick={() => submit.mutate({ quizId: selectedQuiz.id, answers })}>{submit.isPending ? "جارٍ التسليم..." : "تسليم الاختبار"}</button></section></main>;
  }

  if (location === "/student/login" || location === "/student/register") return <main className="student-portal auth" dir="rtl"><section className="student-auth-card"><div className="student-logo">أ</div><span className="student-kicker">بوابة الطالب</span><h1>{isRegister ? "إنشاء حساب الطالب" : "دخول الطالب"}</h1><p>{isRegister ? "استخدم رقم الهاتف المسجل لدى المعلم واختر كلمة المرور بنفسك." : "أدخل رقم هاتفك وكلمة المرور للانتقال إلى بياناتك فقط."}</p><label>رقم هاتف الطالب<input inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="01xxxxxxxxx"/></label><label>كلمة المرور<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="8 أحرف على الأقل"/></label><button type="button" className="student-primary" disabled={register.isPending || login.isPending} onClick={submitCredentials}>{isRegister ? <><UserRound size={17}/> إنشاء الحساب</> : <><LogIn size={17}/> دخول آمن</>}</button><button type="button" className="student-link" onClick={() => setLocation(isRegister ? "/student/login" : "/student/register")}>{isRegister ? "لديك حساب؟ سجّل الدخول" : "لا تملك حسابًا؟ أنشئ حسابك"}</button><small><ShieldCheck size={14}/> لا تظهر لك سوى بياناتك المرتبطة بسجل المعلم.</small></section></main>;

  if (!student.data) {
    return <main className="student-portal auth" dir="rtl"><section className="student-auth-card"><div className="student-logo">أ</div><p>جارٍ التحقق من جلسة الطالب...</p></section></main>;
  }

  const profile = student.data;
  const dueRows = profile.transactions.filter((row: any) => row.kind === "subscription" && !row.paidAt);
  const attendanceRate = profile.attendance.length ? Math.round((profile.attendance.filter((row: any) => row.status === "present" || row.status === "late").length / profile.attendance.length) * 100) : 0;
  return <main className="student-portal" dir="rtl"><section className="student-dashboard"><header className="student-profile-head"><div><span className="student-kicker">بروفايل الطالب</span><h1>{profile.student.name}</h1><p>{profile.group?.name || "لم تُربط مجموعة بعد"} · كود الطالب: {profile.student.studentCode || `ST-${profile.student.id}`}</p></div><button type="button" className="student-logout" onClick={() => logout.mutate()}><LogOut size={16}/> خروج</button></header><div className="student-stat-grid"><article><BookOpen size={20}/><span>المجموعة</span><b>{profile.group?.name || "—"}</b></article><article><CheckCircle2 size={20}/><span>نسبة الحضور</span><b>{attendanceRate}%</b></article><article><LockKeyhole size={20}/><span>المستحقات</span><b>{dueRows.length ? `${dueRows.length} متابعة` : "مسدد"}</b></article></div><section className="student-panel"><div className="student-panel-head"><div><span className="student-kicker">اختباراتك</span><h2>الاختبارات الأسبوعية</h2></div><BookOpen size={21}/></div>{quizzes.isLoading ? <p>جارٍ تحميل الاختبارات...</p> : quizzes.data?.length ? <div className="student-quiz-list">{quizzes.data.map((quiz: any) => { const now = Date.now(); const open = now >= new Date(quiz.startsAt).getTime() && now <= new Date(quiz.endsAt).getTime(); return <article key={quiz.id}><div><b>{quiz.title}</b><small>{quiz.questionType === "mcq" ? "اختيار من متعدد" : quiz.questionType === "true_false" ? "صح أو خطأ" : "مقالي"} · من {quiz.maxScore} درجة</small></div><button type="button" disabled={!open} onClick={() => setSelectedQuiz(quiz)}>{open ? "بدء الاختبار" : now < new Date(quiz.startsAt).getTime() ? "لم يبدأ" : "مغلق"}</button></article>; })}</div> : <p className="student-empty">لا توجد اختبارات أسبوعية متاحة حاليًا.</p>}</section><section className="student-panel compact"><div className="student-panel-head"><div><span className="student-kicker">نتائجي</span><h2>آخر التقييمات</h2></div></div>{profile.assessments.length ? profile.assessments.slice(0, 5).map((assessment: any) => <div className="student-result-row" key={assessment.id}><span>{assessment.title}</span><b>{assessment.score ?? "—"}/{assessment.maxScore ?? "—"}</b></div>) : <p className="student-empty">لم تُسجل تقييمات بعد.</p>}</section></section></main>;
}
