import { useEffect, useRef, useState } from "react";
import { CalendarClock, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { getReminderDelayMinutes } from "../../../shared/reminderTiming";

function toLocalInput(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

export function PersonalRemindersPanel() {
  const { language } = useLanguage();
  const utils = trpc.useUtils();
  const reminders = trpc.app.personalReminders.list.useQuery(undefined, { retry: false });
  const create = trpc.app.personalReminders.create.useMutation({
    onSuccess: () => {
      void utils.app.personalReminders.list.invalidate();
      toast.success(language === "ar" ? "تم حفظ التذكير" : "Reminder saved");
    },
  });
  const update = trpc.app.personalReminders.update.useMutation({ onSuccess: () => void utils.app.personalReminders.list.invalidate() });
  const remove = trpc.app.personalReminders.remove.useMutation({
    onSuccess: () => {
      void utils.app.personalReminders.list.invalidate();
      toast.success(language === "ar" ? "تم حذف التذكير" : "Reminder deleted");
    },
  });

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [remindAt, setRemindAt] = useState(() => toLocalInput(new Date(Date.now() + 3_600_000)));
  const [recurrence, setRecurrence] = useState<"once" | "daily" | "weekly">("once");
  const [clock, setClock] = useState(() => Date.now());
  const locallyNotified = useRef(new Set<number>());
  const notificationPermission = typeof Notification === "undefined" ? "unsupported" : Notification.permission;

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const timers: number[] = [];
    for (const reminder of reminders.data || []) {
      const delay = new Date(reminder.remindAt).getTime() - Date.now();
      if (reminder.completed || delay <= 0 || delay > 86_400_000 || locallyNotified.current.has(reminder.id)) continue;
      timers.push(window.setTimeout(() => {
        if (locallyNotified.current.has(reminder.id) || Notification.permission !== "granted") return;
        locallyNotified.current.add(reminder.id);
        new Notification(language === "ar" ? "ذكّرني" : "Reminder", {
          body: reminder.note ? `${reminder.title} — ${reminder.note}` : reminder.title,
          tag: `personal-reminder-${reminder.id}`,
        });
      }, delay));
    }
    return () => timers.forEach(window.clearTimeout);
  }, [language, reminders.data]);

  const recurrenceLabel = (value: string) => language === "ar"
    ? value === "daily" ? "يومي" : value === "weekly" ? "أسبوعي" : "مرة واحدة"
    : value === "daily" ? "Daily" : value === "weekly" ? "Weekly" : "Once";
  const formatTime = (value: Date | string) => new Date(value).toLocaleString(language === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
  const minutesRemaining = getReminderDelayMinutes(new Date(remindAt), new Date(clock));
  const timingHint = minutesRemaining === null
    ? null
    : minutesRemaining < 0
      ? language === "ar" ? "الموعد المختار مضى؛ غيّره إلى وقت لاحق." : "This time has passed; choose a later time."
      : minutesRemaining === 0
        ? language === "ar" ? "موعد التذكير الآن." : "The reminder is due now."
        : language === "ar"
          ? `سيُحفظ التذكير بعد ${minutesRemaining} دقيقة من الآن.`
          : `This reminder is scheduled in ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}.`;

  const submit = () => {
    const date = new Date(remindAt);
    if (!title.trim()) return toast.error(language === "ar" ? "اكتب ما تريد أن تتذكره." : "Enter what you want to remember.");
    if (!Number.isFinite(date.getTime()) || date.getTime() < Date.now() - 60_000) return toast.error(language === "ar" ? "اختر وقتًا قادمًا." : "Choose a future time.");
    create.mutate({ title: title.trim(), note: note.trim() || null, remindAt: date, recurrence });
    setTitle("");
    setNote("");
    setRecurrence("once");
  };

  return <section className="personal-reminders-panel">
    <div className="reminders-head">
      <div>
        <span className="eyebrow">{language === "ar" ? "تنظيمك الشخصي" : "Personal organization"}</span>
        <h2>{language === "ar" ? "ذكّرني" : "Remind me"}</h2>
        <p>{language === "ar" ? "أضف أي شيء تريد تذكّرَه؛ يُحفظ في حسابك ويمكن تكراره يوميًا أو أسبوعيًا." : "Add anything you need to remember. It is saved to your account and can repeat daily or weekly."}</p>
      </div>
      <CalendarClock size={26} />
    </div>

    {notificationPermission !== "granted" && <div className="integration-note">
      {language === "ar" ? "لن يصل إشعار في موعد التذكير قبل تفعيل إذن الإشعارات على هذا الجهاز." : "A reminder cannot notify this device until notification permission is enabled."} <a href="/settings/notifications">{language === "ar" ? "تفعيل الإشعارات" : "Enable notifications"}</a>
    </div>}

    <div className="reminder-form panel">
      <label>{language === "ar" ? "ما الذي تريد تذكّره؟" : "What should we remind you about?"}
        <input value={title} onChange={event => setTitle(event.target.value)} placeholder={language === "ar" ? "مثال: تحضير ورقة الواجب" : "Example: Prepare homework sheet"} />
      </label>
      <label>{language === "ar" ? "تفاصيل اختيارية" : "Optional details"}
        <textarea value={note} onChange={event => setNote(event.target.value)} placeholder={language === "ar" ? "أضف ملاحظة قصيرة" : "Add a short note"} />
      </label>
      <div className="reminder-form-grid">
        <label>{language === "ar" ? "الموعد" : "When"}
          <input type="datetime-local" value={remindAt} onChange={event => setRemindAt(event.target.value)} />
          {timingHint && <small className={minutesRemaining !== null && minutesRemaining < 0 ? "reminder-timing invalid" : "reminder-timing"}>{timingHint}</small>}
        </label>
        <label>{language === "ar" ? "التكرار" : "Repeat"}
          <select value={recurrence} onChange={event => setRecurrence(event.target.value as typeof recurrence)}>
            <option value="once">{recurrenceLabel("once")}</option>
            <option value="daily">{recurrenceLabel("daily")}</option>
            <option value="weekly">{recurrenceLabel("weekly")}</option>
          </select>
        </label>
      </div>
      <button type="button" className="primary" disabled={create.isPending} onClick={submit}>
        <Plus size={17} />{create.isPending ? (language === "ar" ? "جارٍ الحفظ..." : "Saving...") : (language === "ar" ? "إضافة تذكير" : "Add reminder")}
      </button>
    </div>

    <div className="reminder-list">
      {reminders.isLoading ? <div className="reminder-empty">{language === "ar" ? "جارٍ تحميل التذكيرات..." : "Loading reminders..."}</div>
        : reminders.data?.length ? reminders.data.map(reminder => <article key={reminder.id} className={reminder.completed ? "reminder-row done" : "reminder-row"}>
          <button type="button" className="reminder-complete" aria-label={language === "ar" ? "إكمال التذكير" : "Complete reminder"} onClick={() => update.mutate({ id: reminder.id, data: { completed: !reminder.completed } })}><CheckCircle2 size={20} /></button>
          <div><b>{reminder.title}</b>{reminder.note && <p>{reminder.note}</p>}<small>{formatTime(reminder.remindAt)} · {recurrenceLabel(reminder.recurrence)}</small></div>
          <button type="button" className="icon-button danger" aria-label={language === "ar" ? "حذف التذكير" : "Delete reminder"} onClick={() => remove.mutate({ id: reminder.id })}><Trash2 size={16} /></button>
        </article>)
        : <div className="reminder-empty"><CalendarClock size={24} /><b>{language === "ar" ? "لا توجد تذكيرات بعد" : "No reminders yet"}</b><span>{language === "ar" ? "أضف أول تذكير ليظهر هنا وفي إشعاراتك عند تفعيلها." : "Add your first reminder to see it here and in your notifications when enabled."}</span></div>}
    </div>
  </section>;
}
