import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Eye, Plus, ScanLine, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { normalizeStudentCode } from "../../../shared/studentCode";
import { useLanguage } from "../contexts/LanguageContext";

type QuestionType = "mcq" | "true_false" | "essay";
type Question = { id: string; text: string; points: number; options?: string[]; correctAnswer?: number | boolean };

function newQuestion(type: QuestionType): Question {
  return {
    id: crypto.randomUUID(),
    text: "",
    points: 1,
    ...(type === "mcq" ? { options: ["", "", "", ""], correctAnswer: 0 } : type === "true_false" ? { correctAnswer: true } : {}),
  };
}

function asLocalDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function StudentQuizPreview({
  title,
  groupName,
  questions,
  questionType,
  maxScore,
  close,
}: {
  title: string;
  groupName: string;
  questions: Question[];
  questionType: QuestionType;
  maxScore: number;
  close: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return <div className="quiz-preview-backdrop" role="dialog" aria-modal="true" aria-label="معاينة امتحان الطالب">
    <section className="quiz-preview-card">
      <header className="quiz-preview-head">
        <div><span className="eyebrow">معاينة الطالب</span><h2>{title.trim() || "التقييم الأسبوعي"}</h2><p>{groupName || "المجموعة المختارة"} · من {maxScore} درجة</p></div>
        <button className="icon-button" type="button" aria-label="إغلاق المعاينة" onClick={close}><X size={18}/></button>
      </header>
      <div className="preview-notice">هذه معاينة فقط؛ لن تُحفظ أي إجابات أو تُنشر للطلاب.</div>
      <div className="student-preview-questions">
        {questions.map((question, index) => <article key={question.id}>
          <div className="student-question-label"><b>السؤال {index + 1}</b><span>{question.points} درجة</span></div>
          <p>{question.text.trim() || "اكتب نص السؤال هنا"}</p>
          {questionType === "mcq" && <div className="student-choice-list">{question.options?.map((option, optionIndex) => <label key={optionIndex}><input type="radio" name={`preview-${question.id}`} checked={answers[question.id] === String(optionIndex)} onChange={() => setAnswers(current => ({ ...current, [question.id]: String(optionIndex) }))}/><span>{option.trim() || `الاختيار ${optionIndex + 1}`}</span></label>)}</div>}
          {questionType === "true_false" && <div className="student-choice-list binary"><label><input type="radio" name={`preview-${question.id}`} checked={answers[question.id] === "true"} onChange={() => setAnswers(current => ({ ...current, [question.id]: "true" }))}/><span>صح</span></label><label><input type="radio" name={`preview-${question.id}`} checked={answers[question.id] === "false"} onChange={() => setAnswers(current => ({ ...current, [question.id]: "false" }))}/><span>خطأ</span></label></div>}
          {questionType === "essay" && <textarea value={answers[question.id] || ""} onChange={event => setAnswers(current => ({ ...current, [question.id]: event.target.value }))} placeholder="اكتب إجابتك هنا..." rows={4}/>} 
        </article>)}
      </div>
      <footer><span>إجابات تجريبية: {Object.keys(answers).length}/{questions.length}</span><button className="primary" type="button" onClick={close}>العودة إلى التعديل</button></footer>
    </section>
  </div>;
}

export function WeeklyQuizPanel({ groups, students }: { groups: Array<any>; students: Array<any> }) {
  const { language } = useLanguage();
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState(() => language === "en" ? "Weekly assessment" : "التقييم الأسبوعي");
  const [questionType, setQuestionType] = useState<QuestionType>("mcq");
  const [questions, setQuestions] = useState<Question[]>(() => [newQuestion("mcq")]);
  const [startsAt, setStartsAt] = useState(() => asLocalDateTime(new Date()));
  const [endsAt, setEndsAt] = useState(() => asLocalDateTime(new Date(Date.now() + 60 * 60 * 1000)));
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [score, setScore] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const quizzes = trpc.app.quizzes.list.useQuery();
  const attempts = trpc.app.quizzes.attempts.useQuery({ quizId: Number(selectedQuizId) || 0 }, { enabled: Boolean(selectedQuizId) });
  const focusEvents = trpc.app.quizFocus.list.useQuery({ quizId: Number(selectedQuizId) || 0 }, { enabled: Boolean(selectedQuizId) });
  const createQuiz = trpc.app.quizzes.create.useMutation({ onSuccess: () => { quizzes.refetch(); toast.success("تم إنشاء الاختبار الأسبوعي"); setQuestions([newQuestion(questionType)]); }, onError: error => toast.error(error.message) });
  const gradeEssay = trpc.app.quizzes.gradeByStudentCode.useMutation({ onSuccess: data => { attempts.refetch(); toast.success(`تم رصد ${data.score}/${data.maxScore} للطالب ${data.studentName}`); setStudentCode(""); setScore(""); }, onError: error => toast.error(error.message) });
  const answerOcr = trpc.app.assessments.answerOcr.useMutation({ onSuccess: data => { setStudentCode(normalizeStudentCode(data.studentCode || "")); setScore(data.score || ""); toast.success("تمت قراءة الكود والدرجة؛ راجعهما ثم اضغط رصد الدرجة"); }, onError: () => toast.error("تعذر قراءة ورقة الإجابة") });
  const maxScore = useMemo(() => questions.reduce((total, question) => total + Number(question.points || 0), 0), [questions]);
  const selectedGroupName = groups.find(group => String(group.id) === groupId)?.name || "";
  const selectedQuiz = quizzes.data?.find(quiz => String(quiz.id) === selectedQuizId);

  const updateQuestion = (id: string, patch: Partial<Question>) => setQuestions(current => current.map(question => question.id === id ? { ...question, ...patch } : question));
  const setType = (type: QuestionType) => { setQuestionType(type); setQuestions([newQuestion(type)]); };
  const submit = () => {
    if (!groupId || !title.trim()) return toast.error("اختر المجموعة واكتب عنوان الاختبار");
    if (questions.some(question => !question.text.trim() || question.points <= 0 || (questionType === "mcq" && question.options?.some(option => !option.trim())))) return toast.error("أكمل نص ودرجة كل سؤال واختياراته");
    createQuiz.mutate({ groupId: Number(groupId), title: title.trim(), questionType, questions, startsAt: new Date(startsAt), endsAt: new Date(endsAt), instructions: null });
  };
  const scanAnswerSheet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!selectedQuizId) return toast.error("اختر الاختبار المقال أولًا");
    if (file.size > 5_000_000) return toast.error("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
    const reader = new FileReader();
    reader.onload = () => answerOcr.mutate({ imageDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return <section className="weekly-quiz-workspace">
    <div className="quiz-builder panel">
      <div className="quiz-builder-head"><div><span className="eyebrow">اختبارات المجموعة</span><h3>إنشاء اختبار أسبوعي إلكتروني</h3><p>حدّد الوقت والقالب، ثم راجع شكله كطالب قبل النشر.</p></div><ClipboardCheck size={25}/></div>
      <div className="quiz-builder-grid">
        <label>المجموعة<select value={groupId} onChange={event => setGroupId(event.target.value)}><option value="">اختر المجموعة</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
        <label>عنوان الاختبار<input value={title} onChange={event => setTitle(event.target.value)} /></label>
        <label>يفتح في<input type="datetime-local" value={startsAt} onChange={event => setStartsAt(event.target.value)} /></label>
        <label>يغلق في<input type="datetime-local" value={endsAt} onChange={event => setEndsAt(event.target.value)} /></label>
      </div>
      <div className="quiz-template-switch"><button type="button" className={questionType === "mcq" ? "selected" : ""} onClick={() => setType("mcq")}>اختيار من متعدد</button><button type="button" className={questionType === "true_false" ? "selected" : ""} onClick={() => setType("true_false")}>صح أو خطأ</button><button type="button" className={questionType === "essay" ? "selected" : ""} onClick={() => setType("essay")}>مقالي</button></div>
      <div className="quiz-questions">{questions.map((question, index) => <article key={question.id}>
        <div className="quiz-question-head"><b>السؤال {index + 1}</b>{questions.length > 1 && <button type="button" onClick={() => setQuestions(current => current.filter(item => item.id !== question.id))}><Trash2 size={15}/> حذف</button>}</div>
        <label>نص السؤال<input value={question.text} onChange={event => updateQuestion(question.id, { text: event.target.value })} placeholder="اكتب السؤال"/></label>
        {questionType === "mcq" && <div className="quiz-options">{question.options?.map((option, optionIndex) => <label key={optionIndex}>اختيار {optionIndex + 1}<input value={option} onChange={event => updateQuestion(question.id, { options: question.options?.map((item, itemIndex) => itemIndex === optionIndex ? event.target.value : item) })}/><span><input type="radio" name={`correct-${question.id}`} checked={question.correctAnswer === optionIndex} onChange={() => updateQuestion(question.id, { correctAnswer: optionIndex })}/> الإجابة الصحيحة</span></label>)}</div>}
        {questionType === "true_false" && <div className="quiz-boolean"><button type="button" className={question.correctAnswer === true ? "selected" : ""} onClick={() => updateQuestion(question.id, { correctAnswer: true })}>صح</button><button type="button" className={question.correctAnswer === false ? "selected" : ""} onClick={() => updateQuestion(question.id, { correctAnswer: false })}>خطأ</button></div>}
        <label className="question-points">الدرجة<input inputMode="decimal" value={String(question.points)} onChange={event => updateQuestion(question.id, { points: Number(event.target.value) || 0 })}/></label>
      </article>)}</div>
      <div className="quiz-builder-actions"><button type="button" className="secondary" onClick={() => setQuestions(current => [...current, newQuestion(questionType)])}><Plus size={16}/> إضافة سؤال</button><span>المجموع: {maxScore} درجة</span><button type="button" className="secondary" onClick={() => setPreviewOpen(true)}><Eye size={16}/> معاينة الطالب</button><button type="button" className="primary" disabled={createQuiz.isPending} onClick={submit}>نشر الاختبار</button></div>
    </div>
    <div className="quiz-results panel">
      <div className="quiz-builder-head"><div><span className="eyebrow">المتابعة والرصد</span><h3>نتائج الاختبارات</h3></div><ScanLine size={23}/></div>
      {quizzes.data?.length ? <div className="quiz-result-list">{quizzes.data.map(quiz => <button type="button" className={String(quiz.id) === selectedQuizId ? "selected" : ""} key={quiz.id} onClick={() => setSelectedQuizId(String(quiz.id))}><span>{quiz.title}</span><small>{quiz.questionType === "mcq" ? "اختياري" : quiz.questionType === "true_false" ? "صح/خطأ" : "مقالي"} · {quiz.maxScore} درجة</small></button>)}</div> : <p className="quiz-empty">لم تُنشئ اختبارًا أسبوعيًا بعد.</p>}
      {selectedQuizId && <><div className="essay-grade-bar"><b>تصحيح {selectedQuiz?.questionType === "essay" ? "مقالي" : "يدوي"} بكود الطالب</b>{selectedQuiz?.questionType === "essay" && <label className="secondary essay-scan-button"><ScanLine size={15}/>{answerOcr.isPending ? "جارٍ قراءة الورقة..." : "مسح ورقة الإجابة"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={scanAnswerSheet} hidden/></label>}<input value={studentCode} maxLength={4} inputMode="numeric" onChange={event => setStudentCode(normalizeStudentCode(event.target.value))} placeholder="كود الطالب (4 أرقام)"/><input value={score} onChange={event => setScore(event.target.value)} inputMode="decimal" placeholder="الدرجة"/><button type="button" className="primary" onClick={() => gradeEssay.mutate({ quizId: Number(selectedQuizId), studentCode, score })}>رصد الدرجة</button></div><div className="quiz-attempts">{attempts.data?.length ? attempts.data.map(attempt => <div key={attempt.id}><span>{students.find(student => student.id === attempt.studentId)?.name || `طالب #${attempt.studentId}`}</span><b>{attempt.status === "locked" ? "أُغلق وفق السياسة" : attempt.status === "in_progress" ? "قيد الحل" : attempt.score ?? "بانتظار التصحيح"}</b></div>) : <p className="quiz-empty">لا توجد محاولات بعد.</p>}</div><div className="quiz-focus-events"><div><AlertTriangle size={16}/><b>سجل الخروج من الاختبار</b><small>يسجل فقدان التركيز داخل المتصفح فقط، ولا يثبت منع التطبيقات أو تسجيل الشاشة.</small></div>{focusEvents.data?.length ? focusEvents.data.map(event => <article key={event.id}><span>{event.studentName}</span><b>{event.eventType === "visibility_hidden" ? "انتقل التطبيق للخلفية" : event.eventType === "fullscreen_exit" ? "خرج من ملء الشاشة" : "فقد تركيز النافذة"}</b><time>{new Date(event.createdAt).toLocaleString("ar-EG")}</time></article>) : <p>لا توجد أحداث مسجلة لهذا الاختبار.</p>}</div></>}
    </div>
    {previewOpen && <StudentQuizPreview title={title} groupName={selectedGroupName} questions={questions} questionType={questionType} maxScore={maxScore} close={() => setPreviewOpen(false)} />}
  </section>;
}
