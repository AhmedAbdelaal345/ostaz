import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, LayoutGrid, Settings, Users, WalletCards } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { changeLogActionLabels, changeLogCategoryLabels, type ChangeLogCategory } from "../../../shared/changeLogPresentation";
import { useLanguage } from "@/contexts/LanguageContext";

const filters: Array<{ id: "all" | ChangeLogCategory; label: string }> = [{ id: "all", label: "الكل" }, ...Object.entries(changeLogCategoryLabels).map(([id, label]) => ({ id: id as ChangeLogCategory, label }))];

const categoryIcons = { student: Users, group: LayoutGrid, attendance: CheckCircle2, finance: WalletCards, assessment: ClipboardCheck, settings: Settings } as const;

export function ChangeLogPanel() {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<"all" | ChangeLogCategory>("all");
  const changes = trpc.app.changeLog.list.useQuery({ limit: 100 }, { retry: false });
  const rows = useMemo(() => (changes.data || []).filter(row => filter === "all" || row.category === filter), [changes.data, filter]);
  const formatTime = (value: Date | string) => new Date(value).toLocaleString(language === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const filterLabel = (id: string, label: string) => language === "ar" ? label : id === "all" ? "All" : id === "student" ? "Students" : id === "group" ? "Groups" : id === "attendance" ? "Attendance" : id === "finance" ? "Finance" : id === "assessment" ? "Assessments" : "Settings";
  const actionLabel = (action: string) => language === "ar" ? changeLogActionLabels[action as keyof typeof changeLogActionLabels] : action === "created" ? "Created" : action === "updated" ? "Updated" : action === "deleted" ? "Deleted" : action === "recorded" ? "Recorded" : "Settled";
  const categoryLabel = (category: ChangeLogCategory) => filterLabel(category, changeLogCategoryLabels[category]);
  return <section className="change-log-panel"><div className="change-log-head"><div><span className="eyebrow">{language === "ar" ? "شفافية التشغيل" : "Activity transparency"}</span><h3>{language === "ar" ? "سجل التعديلات" : "Change log"}</h3><p>{language === "ar" ? "آخر العمليات التي أُجريت على بياناتك. يظهر السجل لحسابك فقط." : "Recent actions taken on your data. This log is visible only to your account."}</p></div><button type="button" className="secondary" onClick={() => changes.refetch()}>{language === "ar" ? "تحديث" : "Refresh"}</button></div><div className="change-log-filters">{filters.map(item => <button type="button" key={item.id} className={filter === item.id ? "selected" : ""} onClick={() => setFilter(item.id)}>{filterLabel(item.id, item.label)}</button>)}</div>{changes.isLoading ? <div className="change-log-empty">{language === "ar" ? "جارٍ تحميل السجل..." : "Loading change log..."}</div> : rows.length ? <div className="change-log-list">{rows.map(row => { const Icon = categoryIcons[row.category as ChangeLogCategory] || ClipboardCheck; return <article className="change-log-row" key={row.id}><span className={`change-log-icon ${row.action}`}><Icon size={17}/></span><div><b>{actionLabel(row.action)} · {row.entityName}</b><small>{row.details || categoryLabel(row.category as ChangeLogCategory)}</small></div><time dateTime={new Date(row.createdAt).toISOString()}>{formatTime(row.createdAt)}</time></article>; })}</div> : <div className="change-log-empty"><ClipboardCheck size={21}/><b>{language === "ar" ? "لا توجد تعديلات مسجلة بعد" : "No changes recorded yet"}</b><span>{language === "ar" ? "ستظهر هنا العمليات الجديدة مثل إضافة طالب أو تسجيل حضور أو تحصيل مبلغ." : "New actions such as adding a student, recording attendance, or collecting a payment will appear here."}</span></div>}</section>;
}
