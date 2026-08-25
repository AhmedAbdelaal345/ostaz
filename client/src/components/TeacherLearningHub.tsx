import { useMemo, useState } from "react";
import { BellRing, BookOpenCheck, CheckCircle2, Image, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

type Group = { id: number; name: string };
type ReviewDraft = { score: string; reviewNote: string };

export function TeacherLearningHub({ groups, onBack }: { groups: Group[]; onBack: () => void }) {
  const { language, isRtl } = useLanguage();
  const utils = trpc.useUtils();
  const [groupId, setGroupId] = useState<number | null>(groups[0]?.id ?? null);
  const [message, setMessage] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentInstructions, setAssignmentInstructions] = useState("");
  const [assignmentDueAt, setAssignmentDueAt] = useState("");
  const [reviewAssignmentId, setReviewAssignmentId] = useState<number | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, ReviewDraft>>({});
  const selectedGroup = useMemo(() => groups.find(group => group.id === groupId), [groups, groupId]);
  const messages = trpc.app.community.teacherList.useQuery({ groupId: groupId || 0 }, { enabled: Boolean(groupId) });
  const announcements = trpc.app.community.announcements.useQuery({ groupId: groupId || 0 }, { enabled: Boolean(groupId) });
  const assignments = trpc.app.assignments.teacherList.useQuery({ groupId: groupId || 0 }, { enabled: Boolean(groupId) });
  const submissions = trpc.app.assignments.submissions.useQuery({ assignmentId: reviewAssignmentId || 0 }, { enabled: Boolean(reviewAssignmentId) });
  const invalidate = () => {
    if (!groupId) return;
    utils.app.community.teacherList.invalidate({ groupId });
    utils.app.community.announcements.invalidate({ groupId });
    utils.app.assignments.teacherList.invalidate({ groupId });
  };
  const post = trpc.app.community.teacherPost.useMutation({
    onSuccess: () => { setMessage(""); invalidate(); },
    onError: error => toast.error(error.message),
  });
  const announce = trpc.app.community.announce.useMutation({
    onSuccess: () => {
      setAnnouncementTitle(""); setAnnouncementBody(""); invalidate();
      toast.success(language === "ar" ? "تم نشر التنبيه داخل المجموعة" : "Announcement published to the group");
    },
    onError: error => toast.error(error.message),
  });
  const createAssignment = trpc.app.assignments.create.useMutation({
    onSuccess: () => {
      setAssignmentTitle(""); setAssignmentInstructions(""); setAssignmentDueAt(""); invalidate();
      toast.success(language === "ar" ? "تم حفظ الواجب" : "Assignment saved");
    },
    onError: error => toast.error(error.message),
  });
  const review = trpc.app.assignments.review.useMutation({
    onSuccess: () => {
      if (reviewAssignmentId) utils.app.assignments.submissions.invalidate({ assignmentId: reviewAssignmentId });
      toast.success(language === "ar" ? "تم حفظ المراجعة" : "Review saved");
    },
    onError: error => toast.error(error.message),
  });
  const draftFor = (row: any): ReviewDraft => reviewDrafts[row.id] || { score: row.score || "", reviewNote: row.reviewNote || "" };
  const updateDraft = (id: number, field: keyof ReviewDraft, value: string) => setReviewDrafts(current => ({ ...current, [id]: { ...current[id], [field]: value } }));

  return <main className="student-portal" dir={isRtl ? "rtl" : "ltr"}>
    <section className="student-dashboard learning-hub">
      <button className="student-back" type="button" onClick={onBack}>{language === "ar" ? "عودة إلى الإعدادات" : "Back to settings"}</button>
      <header className="learning-hub-head"><MessageCircle size={27}/><div><span>{language === "ar" ? "إدارة المجموعة" : "Group management"}</span><h1>{language === "ar" ? "النقاشات والواجبات" : "Community & assignments"}</h1><p>{language === "ar" ? "كل ما ينشر هنا يظهر لطلاب المجموعة المختارة فقط." : "Everything here is available only to students in the selected group."}</p></div></header>
      {groups.length ? <>
        <label className="learning-select-label">{language === "ar" ? "اختر المجموعة" : "Select group"}<select value={groupId || ""} onChange={event => { setGroupId(Number(event.target.value)); setReviewAssignmentId(null); }}>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
        <div className="learning-hub-grid">
          <section className="student-panel"><div className="student-panel-head"><div><span className="student-kicker">{language === "ar" ? "غرفة النقاش" : "Discussion room"}</span><h2>{selectedGroup?.name}</h2></div><MessageCircle size={21}/></div><div className="learning-message-list">{messages.data?.length ? messages.data.map((row: any) => <article key={row.id} className={`learning-message ${row.authorType}`}><b>{row.authorType === "student" ? (language === "ar" ? "طالب" : "Student") : row.authorType === "assistant" ? (language === "ar" ? "مساعد" : "Assistant") : (language === "ar" ? "المعلم" : "Teacher")}</b><p>{row.body}</p></article>) : <p className="student-empty">{language === "ar" ? "لا توجد رسائل بعد." : "No messages yet."}</p>}</div><div className="learning-composer"><textarea value={message} onChange={event => setMessage(event.target.value)} placeholder={language === "ar" ? "اكتب رسالة للمجموعة…" : "Write a message to the group…"}/><button className="primary" type="button" disabled={!message.trim() || post.isPending} onClick={() => groupId && post.mutate({ groupId, body: message })}><Send size={16}/>{language === "ar" ? "نشر" : "Post"}</button></div></section>
          <section className="student-panel"><div className="student-panel-head"><div><span className="student-kicker">{language === "ar" ? "تنبيه جماعي" : "Group announcement"}</span><h2>{language === "ar" ? "واجب أو موعد أو تغيير" : "Homework, date, or change"}</h2></div><BellRing size={21}/></div><input value={announcementTitle} onChange={event => setAnnouncementTitle(event.target.value)} placeholder={language === "ar" ? "عنوان التنبيه" : "Announcement title"}/><textarea value={announcementBody} onChange={event => setAnnouncementBody(event.target.value)} placeholder={language === "ar" ? "تفاصيل التنبيه" : "Announcement details"}/><button className="primary" type="button" disabled={!announcementTitle.trim() || !announcementBody.trim() || announce.isPending} onClick={() => groupId && announce.mutate({ groupId, title: announcementTitle, body: announcementBody, audience: "students" })}><BellRing size={16}/>{language === "ar" ? "نشر للطلاب" : "Publish to students"}</button><div className="learning-announcements">{announcements.data?.map((row: any) => <article key={row.id}><b>{row.title}</b><p>{row.body}</p></article>)}</div></section>
          <section className="student-panel"><div className="student-panel-head"><div><span className="student-kicker">{language === "ar" ? "واجب مقالي" : "Written assignment"}</span><h2>{language === "ar" ? "إنشاء واجب" : "Create assignment"}</h2></div><BookOpenCheck size={21}/></div><input value={assignmentTitle} onChange={event => setAssignmentTitle(event.target.value)} placeholder={language === "ar" ? "عنوان الواجب" : "Assignment title"}/><textarea value={assignmentInstructions} onChange={event => setAssignmentInstructions(event.target.value)} placeholder={language === "ar" ? "تعليمات التسليم" : "Submission instructions"}/><label>{language === "ar" ? "موعد التسليم (اختياري)" : "Due date (optional)"}<input type="datetime-local" value={assignmentDueAt} onChange={event => setAssignmentDueAt(event.target.value)}/></label><button className="primary" type="button" disabled={!assignmentTitle.trim() || createAssignment.isPending} onClick={() => groupId && createAssignment.mutate({ groupId, title: assignmentTitle, instructions: assignmentInstructions || null, dueAt: assignmentDueAt ? new Date(assignmentDueAt) : null, status: "published" })}><BookOpenCheck size={16}/>{language === "ar" ? "نشر الواجب" : "Publish assignment"}</button></section>
          <section className="student-panel learning-review-panel"><div className="student-panel-head"><div><span className="student-kicker">{language === "ar" ? "مراجعة التسليمات" : "Submission review"}</span><h2>{language === "ar" ? "صور إجابات الطلاب" : "Student answer images"}</h2></div><Image size={21}/></div><div className="learning-announcements">{assignments.data?.length ? assignments.data.map((row: any) => <article key={row.id} className="assignment-review-choice"><div><b>{row.title}</b><p>{row.instructions || (language === "ar" ? "لا توجد تعليمات إضافية." : "No additional instructions.")}</p></div><button className="secondary" type="button" onClick={() => setReviewAssignmentId(row.id)}>{language === "ar" ? "عرض التسليمات" : "View submissions"}</button></article>) : <p className="student-empty">{language === "ar" ? "لا توجد واجبات منشورة بعد." : "No assignments published yet."}</p>}</div>
            {reviewAssignmentId && <div className="submission-review-list">{submissions.isLoading ? <p className="student-empty">{language === "ar" ? "جارٍ تحميل التسليمات…" : "Loading submissions…"}</p> : submissions.data?.length ? submissions.data.map((row: any) => { const draft = draftFor(row); return <article key={row.id} className="submission-review-card"><div className="submission-review-head"><div><b>{row.studentName}</b><small>{row.status === "reviewed" ? (language === "ar" ? "تمت المراجعة" : "Reviewed") : (language === "ar" ? "بانتظار المراجعة" : "Awaiting review")}</small></div><a href={row.storageUrl} target="_blank" rel="noreferrer">{language === "ar" ? "فتح الصورة" : "Open image"}</a></div><img src={row.storageUrl} alt={language === "ar" ? "صورة إجابة الطالب" : "Student answer image"}/><label>{language === "ar" ? "الدرجة" : "Score"}<input value={draft.score} inputMode="decimal" onChange={event => updateDraft(row.id, "score", event.target.value)} placeholder={language === "ar" ? "اختياري" : "Optional"}/></label><label>{language === "ar" ? "ملاحظة للطالب" : "Feedback for student"}<textarea value={draft.reviewNote} onChange={event => updateDraft(row.id, "reviewNote", event.target.value)} placeholder={language === "ar" ? "اكتب الملاحظة…" : "Write feedback…"}/></label><button className="primary" type="button" disabled={review.isPending} onClick={() => review.mutate({ id: row.id, score: draft.score || null, reviewNote: draft.reviewNote || null })}><CheckCircle2 size={16}/>{language === "ar" ? "حفظ المراجعة" : "Save review"}</button></article>; }) : <p className="student-empty">{language === "ar" ? "لم يرفع أي طالب صورة لهذا الواجب بعد." : "No student has uploaded an image for this assignment yet."}</p>}</div>}
          </section>
        </div>
      </> : <p className="student-empty">{language === "ar" ? "أضف مجموعة أولًا لفتح غرفة نقاش وواجبات لها." : "Create a group first to open its discussion room and assignments."}</p>}
    </section>
  </main>;
}
