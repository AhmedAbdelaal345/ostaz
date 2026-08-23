import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, LayoutGrid, Settings, Users, WalletCards } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { changeLogActionLabels, changeLogCategoryLabels, type ChangeLogCategory } from "../../../shared/changeLogPresentation";

const filters: Array<{ id: "all" | ChangeLogCategory; label: string }> = [{ id: "all", label: "الكل" }, ...Object.entries(changeLogCategoryLabels).map(([id, label]) => ({ id: id as ChangeLogCategory, label }))];

const categoryIcons = { student: Users, group: LayoutGrid, attendance: CheckCircle2, finance: WalletCards, assessment: ClipboardCheck, settings: Settings } as const;

export function ChangeLogPanel() {
  const [filter, setFilter] = useState<"all" | ChangeLogCategory>("all");
  const changes = trpc.app.changeLog.list.useQuery({ limit: 100 }, { retry: false });
  const rows = useMemo(() => (changes.data || []).filter(row => filter === "all" || row.category === filter), [changes.data, filter]);
  const formatTime = (value: Date | string) => new Date(value).toLocaleString("ar-EG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  return <section className="change-log-panel"><div className="change-log-head"><div><span className="eyebrow">شفافية التشغيل</span><h3>سجل التعديلات</h3><p>آخر العمليات التي أُجريت على بياناتك. يظهر السجل لحسابك فقط.</p></div><button type="button" className="secondary" onClick={() => changes.refetch()}>تحديث</button></div><div className="change-log-filters">{filters.map(item => <button type="button" key={item.id} className={filter === item.id ? "selected" : ""} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>{changes.isLoading ? <div className="change-log-empty">جارٍ تحميل السجل...</div> : rows.length ? <div className="change-log-list">{rows.map(row => { const Icon = categoryIcons[row.category as ChangeLogCategory] || ClipboardCheck; return <article className="change-log-row" key={row.id}><span className={`change-log-icon ${row.action}`}><Icon size={17}/></span><div><b>{changeLogActionLabels[row.action as keyof typeof changeLogActionLabels]} · {row.entityName}</b><small>{row.details || changeLogCategoryLabels[row.category as ChangeLogCategory]}</small></div><time dateTime={new Date(row.createdAt).toISOString()}>{formatTime(row.createdAt)}</time></article>; })}</div> : <div className="change-log-empty"><ClipboardCheck size={21}/><b>لا توجد تعديلات مسجلة بعد</b><span>ستظهر هنا العمليات الجديدة مثل إضافة طالب أو تسجيل حضور أو تحصيل مبلغ.</span></div>}</section>;
}
