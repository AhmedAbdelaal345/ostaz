import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  AlarmClock,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  MessageSquareText,
  Pencil,
  Pin,
  PinOff,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "../const";
import { useLanguage } from "../contexts/LanguageContext";
import { useWorkspace } from "../hooks/useWorkspace";
import "./entity-profile-cards.css";
import "./group-attendance-colors.css";
import {
  collectionPeriodLabel,
  formatOutstandingWhatsAppMessage,
  formatSubscriptionWhatsAppMessage,
  formatWeeklyWhatsAppReport,
} from "../../../shared/whatsapp";

const date = (value: Date | string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString(
        document.documentElement.lang === "en" ? "en-GB" : "ar-EG"
      )
    : "—";
const money = (value: number | string) =>
  Number(value || 0).toLocaleString(
    document.documentElement.lang === "en" ? "en-GB" : "ar-EG"
  );
const remainingFor = (student: any, group: any) =>
  Math.max(0, Number(group?.fee || 0) - Number(student?.paidAmount || 0));
function subscriptionEndDate(student: any, group: any) {
  if (group?.collectionPeriod !== "monthly") return null;
  const start = new Date(student?.joinedGroupAt || student?.createdAt || "");
  if (Number.isNaN(start.getTime())) return null;
  start.setMonth(start.getMonth() + 1);
  return start;
}
function whatsappUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("0")
    ? `20${digits.slice(1)}`
    : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

function ProfileShell({
  title,
  subtitle,
  backTo,
  children,
}: {
  title: string;
  subtitle: string;
  backTo: string;
  children: React.ReactNode;
}) {
  const [, setLocation] = useLocation();
  const { isRtl } = useLanguage();
  return (
    <main className="entity-profile" dir={isRtl ? "rtl" : "ltr"}>
      <div className="entity-profile-wrap">
        <header className="entity-profile-head">
          <button type="button" onClick={() => setLocation(backTo)}>
            <ArrowRight size={17} /> رجوع
          </button>
          <div>
            <span>ملف تشغيلي</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>
        <ProfileManagementActions />
        {children}
      </div>
    </main>
  );
}

function StudentAcademicCard({ student }: { student: any }) {
  const utils = trpc.useUtils();
  const [workspace] = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [age, setAge] = useState(student.age ? String(student.age) : "");
  const [grade, setGrade] = useState(student.grade || "");
  const update = trpc.app.students.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.app.students.detail.invalidate({ id: student.id, workspace }),
        utils.app.bootstrap.invalidate({ workspace }),
      ]);
      setEditing(false);
      toast.success("تم تحديث العمر والصف الدراسي");
    },
    onError: error => toast.error(error.message || "تعذر حفظ بيانات الطالب"),
  });
  return (
    <article className="student-academic-card">
      <div className="student-academic-title">
        <h2>
          <BookOpen size={18} /> البيانات الدراسية
        </h2>
        <button
          type="button"
          className="entity-edit-button"
          onClick={() => setEditing(open => !open)}
        >
          {editing ? (
            <>
              <X size={15} /> إلغاء
            </>
          ) : (
            <>
              <Pencil size={15} /> تعديل
            </>
          )}
        </button>
      </div>
      {editing ? (
        <div className="entity-academic-form">
          <label>
            العمر
            <input
              inputMode="numeric"
              value={age}
              onChange={event =>
                setAge(event.target.value.replace(/\D/g, "").slice(0, 3))
              }
              placeholder="مثال: 15"
            />
          </label>
          <label>
            الصف الدراسي
            <input
              value={grade}
              onChange={event => setGrade(event.target.value)}
              placeholder="مثال: الصف الثالث الإعدادي"
            />
          </label>
          <button
            type="button"
            className="entity-save-button"
            disabled={update.isPending}
            onClick={() =>
              update.mutate({
                workspace,
                id: student.id,
                data: {
                  age: age ? Number(age) : null,
                  grade: grade.trim() || null,
                },
              })
            }
          >
            <Save size={15} />
            {update.isPending ? "جارٍ الحفظ..." : "حفظ البيانات"}
          </button>
        </div>
      ) : (
        <dl>
          <div>
            <dt>العمر</dt>
            <dd>{student.age ? `${student.age} سنة` : "غير مضاف"}</dd>
          </div>
          <div>
            <dt>الصف الدراسي</dt>
            <dd>{student.grade || "غير مضاف"}</dd>
          </div>
        </dl>
      )}
    </article>
  );
}

function StudentOperationsCard({ detail }: { detail: any }) {
  const { language } = useLanguage();
  const { student, group } = detail;
  const remaining = remainingFor(student, group);
  const groupName =
    group?.name || (language === "en" ? "the current group" : "الحالية");
  const contact = student.guardianPhone || student.phone;
  const subscriptionMessage = formatSubscriptionWhatsAppMessage({
    studentName: student.name,
    groupName: group?.name || "دون مجموعة",
    joinedAt: student.joinedGroupAt || student.createdAt,
    endsAt: subscriptionEndDate(student, group),
    paidAmount: Number(student.paidAmount || 0),
    remainingAmount: remaining,
  });
  const reminder = formatOutstandingWhatsAppMessage({
    studentName: student.name,
    groupName: group?.name || "دون مجموعة",
    remainingAmount: remaining,
    collectionPeriod: group?.collectionPeriod,
  });
  const dueText =
    language === "en"
      ? `Reminder: ${student.name} has an outstanding amount of ${money(remaining)} EGP in ${groupName}.`
      : `تذكير: لدى ${student.name} مبلغ متبقٍ قدره ${money(remaining)} ج.م في مجموعة ${groupName}.`;
  return (
    <article
      className={`student-payment-card ${remaining > 0 ? "has-due" : ""}`}
    >
      <div className="student-payment-head">
        <div>
          <span>بطاقة الاشتراك</span>
          <h2>
            <CircleDollarSign size={18} /> بيانات المجموعة والدفع
          </h2>
        </div>
        {remaining > 0 ? (
          <b className="student-due-badge">! متبقي</b>
        ) : (
          <b className="student-paid-badge">
            <CheckCircle2 size={14} /> مسدد
          </b>
        )}
      </div>
      <dl className="student-payment-details">
        <div>
          <dt>تاريخ الانضمام</dt>
          <dd>{date(student.joinedGroupAt || student.createdAt)}</dd>
        </div>
        <div>
          <dt>الصف الدراسي</dt>
          <dd>{student.grade || "غير مضاف"}</dd>
        </div>
        <div>
          <dt>نوع الاشتراك</dt>
          <dd>
            {group
              ? collectionPeriodLabel(group.collectionPeriod)
              : "لا توجد مجموعة"}
          </dd>
        </div>
        <div>
          <dt>قيمة الاشتراك</dt>
          <dd>{group ? `${money(group.fee)} ج.م` : "—"}</dd>
        </div>
        <div>
          <dt>المبلغ المدفوع</dt>
          <dd>{money(student.paidAmount)} ج.م</dd>
        </div>
        <div>
          <dt>المبلغ المتبقي</dt>
          <dd
            className={
              remaining > 0 ? "student-due-value" : "student-paid-value"
            }
          >
            {money(remaining)} ج.م
          </dd>
        </div>
      </dl>
      {remaining > 0 && (
        <p className="student-due-reminder">
          <span>!</span>
          {dueText}
        </p>
      )}
      <div className="student-payment-actions">
        {contact && (
          <button
            type="button"
            className="secondary"
            onClick={() =>
              window.open(
                whatsappUrl(contact, subscriptionMessage),
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            رسالة الاشتراك
          </button>
        )}
        {remaining > 0 && contact && (
          <button
            type="button"
            className="primary"
            onClick={() =>
              window.open(
                whatsappUrl(contact, reminder),
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            تذكير بالمبلغ
          </button>
        )}
      </div>
    </article>
  );
}

function StudentManagementCard({ student }: { student: any }) {
  const [workspace] = useWorkspace();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const remove = trpc.app.students.delete.useMutation({
    onSuccess: async () => {
      await utils.app.bootstrap.invalidate({ workspace });
      toast.success("تم حذف الطالب");
      setLocation("/students");
    },
    onError: error => toast.error(error.message || "تعذر حذف الطالب"),
  });
  const deleteStudent = () => {
    if (
      window.confirm(
        `هل تريد حذف الطالب ${student.name}؟ لا يمكن التراجع عن هذا الإجراء.`
      )
    )
      remove.mutate({ workspace, id: student.id });
  };
  return (
    <article className="entity-danger-card">
      <div>
        <span>إدارة السجل</span>
        <h2>
          <Trash2 size={18} /> حذف الطالب
        </h2>
        <p>يحذف ملف الطالب من هذه المساحة فقط بعد تأكيدك.</p>
      </div>
      <button
        type="button"
        className="danger-action"
        disabled={remove.isPending}
        onClick={deleteStudent}
      >
        {remove.isPending ? "جارٍ الحذف..." : "حذف الطالب"}
      </button>
    </article>
  );
}

function GroupCommunicationPanel({ detail }: { detail: any }) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const days = period === "weekly" ? 7 : 30;
  const start = Date.now() - days * 86_400_000;
  const ratingLabel = (value?: string | null) => value === "weak" ? "ضعيف (ض)" : value === "good" ? "جيد (ج)" : value === "very_good" ? "جيد جدًا (جج)" : value === "excellent" ? "ممتاز (م)" : "غير مسجل";
  const filtered = detail.students.filter((student: any) =>
    `${student.name} ${student.phone || ""} ${student.studentCode || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );
  const report = (student: any) => {
    const attendance = detail.attendance.filter(
      (row: any) =>
        row.studentId === student.id &&
        new Date(row.lessonDate).getTime() >= start
    );
    const present = attendance.filter(
      (row: any) => row.status === "present"
    ).length;
    const late = attendance.filter((row: any) => row.status === "late").length;
    const absent = attendance.filter(
      (row: any) => row.status === "absent"
    ).length;
    const assessments = detail.assessments
      .filter(
        (row: any) =>
          row.studentId === student.id &&
          (!row.createdAt || new Date(row.createdAt).getTime() >= start)
      )
      .map(
        (row: any) => `${row.title}: ${row.score ?? "—"}/${row.maxScore ?? "—"}`
      );
    const assignmentIds = new Set(
      (detail.assignments || [])
        .filter(
          (row: any) =>
            !row.createdAt || new Date(row.createdAt).getTime() >= start
        )
        .map((row: any) => row.id)
    );
    const homework = (detail.assignmentSubmissions || [])
      .filter(
        (row: any) =>
          row.studentId === student.id && assignmentIds.has(row.assignmentId)
      )
      .map(
        (row: any) =>
          `${row.status === "reviewed" ? "واجب تمت مراجعته" : "واجب تم تسليمه"}${row.score ? `: ${row.score}` : ""}`
      );
    const followUps = (detail.followUps || []).filter((row: any) => row.studentId === student.id && new Date(row.followupDate).getTime() >= start);
    const recitation = followUps.filter((row: any) => row.recitation).map((row: any) => `${date(row.followupDate)}: ${ratingLabel(row.recitation)}`);
    const dailyHomework = followUps.filter((row: any) => row.homework).map((row: any) => `${date(row.followupDate)}: ${ratingLabel(row.homework)}`);
    return formatWeeklyWhatsAppReport({
      studentName: student.name,
      groupName: detail.group.name,
      present,
      late,
      absent,
      assessments,
      recitation,
      homework: [...dailyHomework, ...homework],
      paidAmount: Number(student.paidAmount || 0),
      remainingAmount: remainingFor(student, detail.group),
      period,
    });
  };
  const openSubscription = (student: any) => {
    const phone = student.guardianPhone || student.phone;
    if (!phone) return toast.error("لا يوجد رقم WhatsApp للطالب أو ولي الأمر.");
    const message = formatSubscriptionWhatsAppMessage({ studentName: student.name, groupName: detail.group.name, joinedAt: student.joinedGroupAt || student.createdAt, endsAt: subscriptionEndDate(student, detail.group), paidAmount: Number(student.paidAmount || 0), remainingAmount: remainingFor(student, detail.group) });
    window.open(whatsappUrl(phone, message), "_blank", "noopener,noreferrer");
  };
  const openReport = (student: any, recipient: "student" | "guardian") => {
    const phone =
      recipient === "guardian" ? student.guardianPhone : student.phone;
    if (!phone)
      return toast.error(
        `لا يوجد رقم WhatsApp ${recipient === "guardian" ? "لولي الأمر" : "للطالب"}.`
      );
    window.open(
      whatsappUrl(phone, report(student)),
      "_blank",
      "noopener,noreferrer"
    );
  };
  const openAll = (recipient: "student" | "guardian") => {
    const recipients = detail.students.filter((student: any) =>
      recipient === "guardian" ? student.guardianPhone : student.phone
    );
    if (!recipients.length)
      return toast.error("لا توجد أرقام WhatsApp صالحة للإرسال.");
    if (
      !window.confirm(
        `سيتم فتح ${recipients.length} رسالة WhatsApp جاهزة بالتتابع. أرسل كل رسالة من WhatsApp قبل الانتقال للتالية.`
      )
    )
      return;
    recipients.forEach((student: any, index: number) =>
      window.setTimeout(() => openReport(student, recipient), index * 600)
    );
  };
  return (
    <article className="group-communication wide">
      <div className="group-communication-head">
        <div>
          <span>التواصل والتقارير</span>
          <h2>
            <MessageSquareText size={18} /> تقارير WhatsApp للطلاب
          </h2>
        </div>
        <div className="group-report-period">
          <button
            type="button"
            className={period === "weekly" ? "selected" : ""}
            onClick={() => setPeriod("weekly")}
          >
            أسبوعي
          </button>
          <button
            type="button"
            className={period === "monthly" ? "selected" : ""}
            onClick={() => setPeriod("monthly")}
          >
            شهري
          </button>
        </div>
      </div>
      <p className="group-report-note">
        يفتح الإرسال الجماعي رسائل جاهزة بالتتابع؛ يبقى الضغط على «إرسال» داخل
        WhatsApp بيدك.
      </p>
      <div className="group-student-search">
        <Search size={17} />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="ابحث بالاسم أو الهاتف أو كود الطالب داخل المجموعة..."
        />
        <span>{filtered.length} طالب</span>
      </div>
      <div className="group-bulk-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => openAll("student")}
        >
          إرسال التقرير لكل الطلاب
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => openAll("guardian")}
        >
          إرسال التقرير لكل أولياء الأمور
        </button>
      </div>
      <div className="group-contact-list">
        {filtered.length ? (
          filtered.map((student: any) => (
            <div key={student.id}>
              <a href={`/students/${student.id}`}>
                <span>
                  {student.name}
                  <small>
                    {student.studentCode || `ST-${student.id}`} ·{" "}
                    {student.phone || "لا هاتف طالب"}
                  </small>
                </span>
              </a>
              <div className="group-contact-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => openReport(student, "student")}
                >
                  واتساب الطالب
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => openReport(student, "guardian")}
                >
                  ولي الأمر
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => openSubscription(student)}
                >
                  رسالة الاشتراك
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>لا توجد نتائج مطابقة داخل هذه المجموعة.</p>
        )}
      </div>
    </article>
  );
}

function GroupLiveWidget({ detail }: { detail: any }) {
  const [now, setNow] = useState(() => new Date());
  const [note, setNote] = useState("");
  const [workspace] = useWorkspace();
  const notes = trpc.app.groupNotes.list.useQuery({
    groupId: detail.group.id,
    workspace,
  });
  const utils = trpc.useUtils();
  const refresh = () =>
    utils.app.groupNotes.list.invalidate({
      groupId: detail.group.id,
      workspace,
    });
  const create = trpc.app.groupNotes.create.useMutation({
    onSuccess: () => {
      setNote("");
      refresh();
    },
    onError: () => toast.error("تعذر حفظ الملاحظة"),
  });
  const update = trpc.app.groupNotes.update.useMutation({
    onSuccess: refresh,
    onError: () => toast.error("تعذر تحديث الملاحظة"),
  });
  const remove = trpc.app.groupNotes.remove.useMutation({
    onSuccess: refresh,
    onError: () => toast.error("تعذر حذف الملاحظة"),
  });
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const end = useMemo(() => {
    const entries = (() => {
      try {
        return detail.group.scheduleJson
          ? JSON.parse(detail.group.scheduleJson)
          : [{ day: detail.group.day, time: detail.group.time }];
      } catch {
        return [{ day: detail.group.day, time: detail.group.time }];
      }
    })();
    const days: Record<string, number> = {
      الأحد: 0,
      الإثنين: 1,
      الثلاثاء: 2,
      الأربعاء: 3,
      الخميس: 4,
      الجمعة: 5,
      السبت: 6,
    };
    for (const entry of entries) {
      const match = String(entry.time || "").match(
        /(\d{1,2})\s*:\s*(\d{2})\s*(ص|م)/
      );
      if (!match || days[entry.day] === undefined) continue;
      const start = new Date(now);
      start.setHours(
        (Number(match[1]) % 12) + (match[3] === "م" ? 12 : 0),
        Number(match[2]),
        0,
        0
      );
      start.setDate(
        start.getDate() + ((days[entry.day] - now.getDay() + 7) % 7)
      );
      const possibleEnd = new Date(
        start.getTime() + Number(detail.group.durationMinutes || 60) * 60_000
      );
      if (now >= start && now < possibleEnd) return possibleEnd;
    }
    return null;
  }, [
    detail.group.day,
    detail.group.durationMinutes,
    detail.group.scheduleJson,
    detail.group.time,
    now,
  ]);
  if (!end) return null;
  const day = now.toISOString().slice(0, 10);
  const todayRows = detail.attendance.filter(
    (row: any) => new Date(row.lessonDate).toISOString().slice(0, 10) === day
  );
  const present = todayRows.filter(
    (row: any) => row.status === "present" || row.status === "late"
  ).length;
  const absent = todayRows.filter((row: any) => row.status === "absent").length;
  const minutes = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / 60_000)
  );
  return (
    <section className="group-live-widget">
      <div className="group-live-title">
        <div>
          <span>
            <i /> مجموعة نشطة الآن
          </span>
          <h2>
            <AlarmClock size={18} /> يتبقى {minutes} دقيقة لانتهاء الحصة
          </h2>
        </div>
        <b>{detail.group.name}</b>
      </div>
      <div className="group-live-stats">
        <article>
          <Users size={17} />
          <span>طلاب المجموعة</span>
          <b>{detail.students.length}</b>
        </article>
        <article>
          <CheckCircle2 size={17} />
          <span>حاضر / متأخر</span>
          <b>{present}</b>
        </article>
        <article>
          <X size={17} />
          <span>غائب</span>
          <b>{absent}</b>
        </article>
      </div>
      <div className="group-live-notes">
        <div>
          <b>ملاحظات المجموعة</b>
          <small>أكملها أو جدّدها أو احذفها يدويًا.</small>
        </div>
        <form
          onSubmit={event => {
            event.preventDefault();
            if (note.trim())
              create.mutate({
                groupId: detail.group.id,
                body: note.trim(),
                workspace,
              });
          }}
        >
          <input
            value={note}
            onChange={event => setNote(event.target.value)}
            maxLength={500}
            placeholder="أضف ملاحظة للحصة..."
          />
          <button
            type="submit"
            className="secondary"
            disabled={create.isPending}
          >
            <Plus size={15} /> إضافة
          </button>
        </form>
        {notes.data?.length ? (
          <div className="group-live-note-list">
            {notes.data.map(item => (
              <article key={item.id} className={item.completed ? "done" : ""}>
                <button
                  type="button"
                  className="group-note-check"
                  onClick={() =>
                    update.mutate({
                      id: item.id,
                      completed: !item.completed,
                      workspace,
                    })
                  }
                  aria-label={
                    item.completed ? "إعادة فتح الملاحظة" : "إكمال الملاحظة"
                  }
                >
                  {item.completed ? <CheckCircle2 size={16} /> : <span />}
                </button>
                <p>{item.body}</p>
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      update.mutate({ id: item.id, renew: true, workspace })
                    }
                    title="تجديد"
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove.mutate({ id: item.id, workspace })}
                    title="حذف"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="group-live-empty">
            لا توجد ملاحظات نشطة لهذه المجموعة.
          </p>
        )}
      </div>
    </section>
  );
}

function GroupManagementCard({ group }: { group: any }) {
  const [workspace] = useWorkspace();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const update = trpc.app.groups.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.app.groups.detail.invalidate({ workspace, id: group.id }),
        utils.app.bootstrap.invalidate({ workspace }),
      ]);
      toast.success(
        group.isPinned ? "تم إلغاء تثبيت المجموعة" : "تم تثبيت المجموعة"
      );
    },
    onError: error => toast.error(error.message || "تعذر تحديث المجموعة"),
  });
  const remove = trpc.app.groups.delete.useMutation({
    onSuccess: async () => {
      await utils.app.bootstrap.invalidate({ workspace });
      toast.success("تم حذف المجموعة مع إبقاء طلابها دون مجموعة");
      setLocation("/groups");
    },
    onError: error => toast.error(error.message || "تعذر حذف المجموعة"),
  });
  const deleteGroup = () => {
    if (
      window.confirm(
        `هل تريد حذف مجموعة ${group.name}؟ سيبقى الطلاب مسجلين دون مجموعة.`
      )
    )
      remove.mutate({ workspace, id: group.id });
  };
  return (
    <article className="group-management-card wide">
      <div>
        <span>إدارة المجموعة</span>
        <h2>
          <Pin size={18} /> تثبيت وحذف
        </h2>
        <p>
          {group.isPinned
            ? "هذه المجموعة مثبتة حاليًا لتسهيل الوصول إليها."
            : "ثبّت هذه المجموعة لتظهر في مقدمة بطاقات المجموعات."}
        </p>
      </div>
      <div className="group-management-actions">
        <button
          type="button"
          className="secondary"
          disabled={update.isPending}
          onClick={() =>
            update.mutate({
              workspace,
              id: group.id,
              data: { isPinned: !group.isPinned },
            })
          }
        >
          {group.isPinned ? (
            <>
              <PinOff size={16} /> إلغاء التثبيت
            </>
          ) : (
            <>
              <Pin size={16} /> تثبيت المجموعة
            </>
          )}
        </button>
        <button
          type="button"
          className="danger-action"
          disabled={remove.isPending}
          onClick={deleteGroup}
        >
          <Trash2 size={16} />
          {remove.isPending ? "جارٍ الحذف..." : "حذف المجموعة"}
        </button>
      </div>
    </article>
  );
}

function ProfileManagementActions() {
  const [location] = useLocation();
  const auth = useAuth();
  const [workspace] = useWorkspace();
  const studentId = Number(location.match(/^\/students\/(\d+)$/)?.[1] || 0);
  const groupId = Number(location.match(/^\/groups\/(\d+)$/)?.[1] || 0);
  const student = trpc.app.students.detail.useQuery(
    { id: studentId, workspace },
    { enabled: auth.isAuthenticated && Boolean(studentId), staleTime: 30_000 }
  );
  const group = trpc.app.groups.detail.useQuery(
    { id: groupId, workspace },
    { enabled: auth.isAuthenticated && Boolean(groupId), staleTime: 30_000 }
  );
  if (studentId && student.data?.student)
    return (
      <section className="entity-management-actions">
        <StudentManagementCard student={student.data.student} />
      </section>
    );
  if (groupId && group.data?.group)
    return (
      <section className="entity-management-actions">
        <GroupManagementCard group={group.data.group} />
      </section>
    );
  return null;
}

export function GroupQuickAttendance({ detail, showMessageTemplates = false }: { detail: any; showMessageTemplates?: boolean }) {
  const utils = trpc.useUtils();
  const [workspace] = useWorkspace();
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<number, "present" | "late" | "absent">>({});
  const mark = trpc.app.attendance.mark.useMutation({
    onSuccess: () => {
      utils.app.groups.detail.invalidate({ id: detail.group.id, workspace });
      toast.success("تم حفظ حالة الحضور");
    },
    onError: error => toast.error(error.message || "تعذر حفظ الحضور"),
  });
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const todayKey = today.toISOString().slice(0, 10);
  const saveFollowUp = trpc.app.dailyFollowUps.save.useMutation({
    onSuccess: () => {
      utils.app.groups.detail.invalidate({ id: detail.group.id, workspace });
      toast.success("تم حفظ متابعة التسميع والواجب");
    },
    onError: error => toast.error(error.message || "تعذر حفظ المتابعة اليومية"),
  });
  const ratings = [
    ["weak", "ض"],
    ["good", "ج"],
    ["very_good", "جج"],
    ["excellent", "م"],
  ] as const;
  const ratingName = (value?: string | null) =>
    value === "weak"
      ? "ضعيف"
      : value === "good"
        ? "جيد"
        : value === "very_good"
          ? "جيد جدًا"
          : value === "excellent"
            ? "ممتاز"
            : "غير مسجل";
  const roster = detail.students
    .map((student: any) => ({
      student,
      status: detail.attendance.find(
        (row: any) =>
          row.studentId === student.id &&
          new Date(row.lessonDate).toISOString().slice(0, 10) === todayKey
      )?.status,
    }))
    .sort(
      (a: any, b: any) =>
        Number(b.status === "late") - Number(a.status === "late")
    );
  const saveRating = (
    student: any,
    existing: any,
    field: "recitation" | "homework",
    value: (typeof ratings)[number][0]
  ) =>
    saveFollowUp.mutate({
      workspace,
      studentId: student.id,
      groupId: detail.group.id,
      followupDate: today,
      recitation: field === "recitation" ? value : existing?.recitation ?? null,
      homework: field === "homework" ? value : existing?.homework ?? null,
    });
  const markDailyAttendance = (student: any, previousStatus: "present" | "late" | "absent" | undefined, status: "present" | "late" | "absent") => {
    setAttendanceOverrides(current => ({ ...current, [student.id]: status }));
    mark.mutate({ workspace, studentId: student.id, groupId: detail.group.id, lessonDate: today, status }, {
      onError: () => {
        setAttendanceOverrides(current => {
          const next = { ...current };
          if (previousStatus) next[student.id] = previousStatus;
          else delete next[student.id];
          return next;
        });
      },
    });
  };
  return (
    <>
    <article className="group-quick-attendance wide">
      <div className="group-quick-attendance-head">
        <div>
          <span>الحضور السريع</span>
          <h2>
            <CheckCircle2 size={18} /> طلاب المجموعة اليوم
          </h2>
          <p>اضغط كارت الطالب للتفاصيل؛ الحضور والتسميع والواجب يُحفظون فورًا.</p>
        </div>
        <b>{date(today)}</b>
      </div>
      <div className="student-daily-card-list">
        {roster.length ? (
          roster.map(({ student, status }: any) => {
            const effectiveStatus = attendanceOverrides[student.id] ?? status;
            const remaining = remainingFor(student, detail.group);
            const followUp = detail.followUps?.find(
              (row: any) =>
                row.studentId === student.id &&
                new Date(row.followupDate).toISOString().slice(0, 10) === todayKey
            );
            const isExpanded = expandedStudentId === student.id;
            return (
              <article key={student.id} className={`student-daily-card attendance-${effectiveStatus || "unmarked"} ${effectiveStatus === "late" ? "late" : ""} ${isExpanded ? "expanded" : ""}`}>
                <div className="student-daily-card-top">
                  <button type="button" className="student-daily-card-toggle" onClick={() => setExpandedStudentId(current => current === student.id ? null : student.id)} aria-expanded={isExpanded}>
                    <span className="student-daily-avatar">{student.name.slice(0, 1)}</span>
                    <span><b>{student.name}</b><small>{student.studentCode || `ST-${student.id}`} · {student.grade || "الصف غير مضاف"}</small></span>
                    <em>{isExpanded ? "إخفاء" : "التفاصيل"}</em>
                  </button>
                <div className="quick-roster-status">
                  <button
                    type="button"
                    className={effectiveStatus === "present" ? "selected present" : ""}
                    aria-pressed={effectiveStatus === "present"}
                    disabled={mark.isPending}
                    onClick={() => markDailyAttendance(student, status, "present")}
                  >
                    حاضر
                  </button>
                  <button
                    type="button"
                    className={effectiveStatus === "late" ? "selected late" : ""}
                    aria-pressed={effectiveStatus === "late"}
                    disabled={mark.isPending}
                    onClick={() => markDailyAttendance(student, status, "late")}
                  >
                    متأخر
                  </button>
                  <button
                    type="button"
                    className={effectiveStatus === "absent" ? "selected absent" : ""}
                    aria-pressed={effectiveStatus === "absent"}
                    disabled={mark.isPending}
                    onClick={() => markDailyAttendance(student, status, "absent")}
                  >
                    غائب
                  </button>
                </div>
                </div>
                {isExpanded && (
                  <div className="student-daily-card-details">
                    <div className={`student-subscription-status ${remaining > 0 ? "due" : "paid"}`}>
                      <span>{remaining > 0 ? "متبقي" : "مدفوع"}</span>
                      <b>{remaining > 0 ? `${money(remaining)} ج.م` : `${money(student.paidAmount)} ج.م`}</b>
                      <small>اشتراك {collectionPeriodLabel(detail.group.collectionPeriod)}</small>
                    </div>
                    <div className="student-daily-rating-grid">
                      {(["recitation", "homework"] as const).map(field => (
                        <fieldset key={field}>
                          <legend>{field === "recitation" ? "التسميع" : "الواجب"} <small>{ratingName(followUp?.[field])}</small></legend>
                          <div>
                            {ratings.map(([value, label]) => <button key={value} type="button" className={followUp?.[field] === value ? "selected" : ""} disabled={saveFollowUp.isPending} onClick={() => saveRating(student, followUp, field, value)} title={ratingName(value)}>{label}</button>)}
                          </div>
                        </fieldset>
                      ))}
                    </div>
                    <a className="student-daily-profile-link" href={`/students/${student.id}`}>فتح بروفايل الطالب</a>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <p>لا يوجد طلاب مرتبطون بالمجموعة بعد.</p>
        )}
      </div>
    </article>
    {showMessageTemplates && <GroupCommunicationPanel detail={detail} />}
    </>
  );
}

export default function EntityProfile() {
  const [location] = useLocation();
  const auth = useAuth();
  const { isRtl } = useLanguage();
  const [workspace] = useWorkspace();
  const studentId = Number(location.match(/^\/students\/(\d+)$/)?.[1] || 0);
  const groupId = Number(location.match(/^\/groups\/(\d+)$/)?.[1] || 0);
  const student = trpc.app.students.detail.useQuery(
    { id: studentId, workspace },
    { enabled: auth.isAuthenticated && Boolean(studentId) }
  );
  const group = trpc.app.groups.detail.useQuery(
    { id: groupId, workspace },
    { enabled: auth.isAuthenticated && Boolean(groupId) }
  );
  if (auth.loading)
    return (
      <main className="entity-profile loading" dir={isRtl ? "rtl" : "ltr"}>
        جارٍ تجهيز البروفايل...
      </main>
    );
  if (!auth.isAuthenticated)
    return (
      <main className="entity-profile auth-gate" dir={isRtl ? "rtl" : "ltr"}>
        <section>
          <h1>بروفايل خاص بالمعلم</h1>
          <p>سجّل الدخول للوصول إلى بيانات طلابك ومجموعاتك.</p>
          <button type="button" onClick={() => startLogin()}>
            تسجيل الدخول
          </button>
        </section>
      </main>
    );
  if (studentId) {
    if (student.isLoading)
      return (
        <main className="entity-profile loading" dir={isRtl ? "rtl" : "ltr"}>
          جارٍ تحميل ملف الطالب...
        </main>
      );
    if (!student.data)
      return (
        <ProfileShell
          title="الطالب غير موجود"
          subtitle="تأكد من رابط البروفايل."
          backTo="/groups"
        >
          <p className="entity-empty">
            لا يمكن العثور على هذا الطالب ضمن حسابك.
          </p>
        </ProfileShell>
      );
    const detail = student.data;
    const paid = detail.transactions
      .filter((row: any) => row.kind === "subscription" && Boolean(row.paidAt))
      .reduce((sum: number, row: any) => sum + Number(row.amount), 0);
    const attendanceRate = detail.attendance.length
      ? Math.round(
          (detail.attendance.filter((row: any) => row.status !== "absent")
            .length /
            detail.attendance.length) *
            100
        )
      : 0;
    return (
      <ProfileShell
        title={detail.student.name}
        subtitle={`${detail.group?.name || "دون مجموعة"} · كود الطالب: ${detail.student.studentCode || `ST-${detail.student.id}`}`}
        backTo="/groups"
      >
        <section className="entity-summary">
          <article>
            <CheckCircle2 />
            <span>نسبة الحضور</span>
            <b>{attendanceRate}%</b>
          </article>
          <article>
            <CircleDollarSign />
            <span>المحصّل</span>
            <b>{money(paid)} ج.م</b>
          </article>
          <article>
            <ClipboardList />
            <span>التقييمات</span>
            <b>{detail.assessments.length}</b>
          </article>
        </section>
        <section className="entity-detail-grid">
          <StudentOperationsCard detail={detail} />
          <article>
            <h2>
              <Users size={18} /> بيانات التواصل
            </h2>
            <dl>
              <div>
                <dt>هاتف الطالب</dt>
                <dd>{detail.student.phone || "غير مسجل"}</dd>
              </div>
              <div>
                <dt>ولي الأمر</dt>
                <dd>{detail.student.guardianName || "غير مسجل"}</dd>
              </div>
              <div>
                <dt>هاتف ولي الأمر</dt>
                <dd>{detail.student.guardianPhone || "غير مسجل"}</dd>
              </div>
              <div>
                <dt>المجموعة</dt>
                <dd>{detail.group?.name || "غير محددة"}</dd>
              </div>
            </dl>
          </article>
          <StudentAcademicCard student={detail.student} />
          <article>
            <h2>
              <CalendarDays size={18} /> آخر الحضور
            </h2>
            <div className="entity-row-list">
              {detail.attendance.length ? (
                detail.attendance.slice(0, 6).map((row: any) => (
                  <div key={row.id}>
                    <span>{date(row.lessonDate)}</span>
                    <b className={`attendance-${row.status}`}>
                      {row.status === "present"
                        ? "حاضر"
                        : row.status === "late"
                          ? "متأخر"
                          : "غائب"}
                    </b>
                  </div>
                ))
              ) : (
                <p>لا توجد سجلات حضور بعد.</p>
              )}
            </div>
          </article>
          <article>
            <h2>
              <BookOpen size={18} /> التقييمات
            </h2>
            <div className="entity-row-list">
              {detail.assessments.length ? (
                detail.assessments.slice(0, 6).map((row: any) => (
                  <div key={row.id}>
                    <span>
                      {row.title} · {row.period}
                    </span>
                    <b>
                      {row.score ?? "—"}/{row.maxScore ?? "—"}
                    </b>
                  </div>
                ))
              ) : (
                <p>لا توجد تقييمات بعد.</p>
              )}
            </div>
          </article>
          <article>
            <h2>
              <CircleDollarSign size={18} /> السجل المالي
            </h2>
            <div className="entity-row-list">
              {detail.transactions.length ? (
                detail.transactions.slice(0, 6).map((row: any) => (
                  <div key={row.id}>
                    <span>
                      {row.description || "اشتراك"} · {date(row.dueDate)}
                    </span>
                    <b className={row.paidAt ? "money-paid" : "money-due"}>
                      {row.paidAt ? "تم السداد" : "مستحق"}
                    </b>
                  </div>
                ))
              ) : (
                <p>لا توجد عمليات مالية بعد.</p>
              )}
            </div>
          </article>
        </section>
      </ProfileShell>
    );
  }
  if (groupId) {
    if (group.isLoading)
      return (
        <main className="entity-profile loading" dir={isRtl ? "rtl" : "ltr"}>
          جارٍ تحميل ملف المجموعة...
        </main>
      );
    if (!group.data)
      return (
        <ProfileShell
          title="المجموعة غير موجودة"
          subtitle="تأكد من رابط البروفايل."
          backTo="/groups"
        >
          <p className="entity-empty">
            لا يمكن العثور على هذه المجموعة ضمن حسابك.
          </p>
        </ProfileShell>
      );
    const detail = group.data;
    const collected = detail.transactions
      .filter((row: any) => row.kind === "subscription" && row.paidAt)
      .reduce((sum: number, row: any) => sum + Number(row.amount), 0);
    const absences = detail.attendance.filter(
      (row: any) => row.status === "absent"
    ).length;
    return (
      <ProfileShell
        title={detail.group.name}
        subtitle={`${detail.group.place} · ${detail.group.mode} · ${detail.group.day} ${detail.group.time}`}
        backTo="/groups"
      >
        <GroupLiveWidget detail={detail} />
        <section className="entity-summary">
          <article>
            <Users />
            <span>الطلاب</span>
            <b>{detail.students.length}</b>
          </article>
          <article>
            <CircleDollarSign />
            <span>المحصّل</span>
            <b>{money(collected)} ج.م</b>
          </article>
          <article>
            <CheckCircle2 />
            <span>الغياب المسجل</span>
            <b>{absences}</b>
          </article>
        </section>
        <section className="entity-detail-grid">
          <GroupQuickAttendance detail={detail} />
          <article>
            <h2>
              <CalendarDays size={18} /> الجدول والتحصيل
            </h2>
            <dl>
              <div>
                <dt>الموعد</dt>
                <dd>
                  {detail.group.day} · {detail.group.time}
                </dd>
              </div>
              <div>
                <dt>رسوم الطالب</dt>
                <dd>{money(detail.group.fee)} ج.م</dd>
              </div>
              <div>
                <dt>نوع الاشتراك</dt>
                <dd>{collectionPeriodLabel(detail.group.collectionPeriod)}</dd>
              </div>
              <div>
                <dt>عدد التقييمات</dt>
                <dd>{detail.assessments.length}</dd>
              </div>
            </dl>
          </article>
          <article>
            <h2>
              <CheckCircle2 size={18} /> آخر سجلات الحضور
            </h2>
            <div className="entity-row-list">
              {detail.attendance.length ? (
                detail.attendance.slice(0, 8).map((row: any) => (
                  <div key={row.id}>
                    <span>{date(row.lessonDate)}</span>
                    <b className={`attendance-${row.status}`}>
                      {row.status === "present"
                        ? "حاضر"
                        : row.status === "late"
                          ? "متأخر"
                          : "غائب"}
                    </b>
                  </div>
                ))
              ) : (
                <p>لا توجد سجلات حضور بعد.</p>
              )}
            </div>
          </article>
          <article>
            <h2>
              <BookOpen size={18} /> آخر التقييمات
            </h2>
            <div className="entity-row-list">
              {detail.assessments.length ? (
                detail.assessments.slice(0, 8).map((row: any) => (
                  <div key={row.id}>
                    <span>{row.title}</span>
                    <b>
                      {row.score ?? "—"}/{row.maxScore ?? "—"}
                    </b>
                  </div>
                ))
              ) : (
                <p>لا توجد تقييمات بعد.</p>
              )}
            </div>
          </article>
          <GroupCommunicationPanel detail={detail} />
        </section>
      </ProfileShell>
    );
  }
  return (
    <main className="entity-profile loading" dir={isRtl ? "rtl" : "ltr"}>
      الرابط غير صالح.
    </main>
  );
}
