import { BarChart3, Crown, Printer, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { buildMonthlyPerformanceCards, buildPerformanceLeaderboard } from "../../../shared/performanceSummary";

export function PerformanceLeaderboard() {
  const students = trpc.app.students.list.useQuery();
  const assessments = trpc.app.assessments.list.useQuery();
  if (students.isLoading || assessments.isLoading) return <div className="panel performance-loading">جارٍ احتساب ترتيب الطلاب...</div>;
  const weekly = buildPerformanceLeaderboard(students.data || [], assessments.data || [], "weekly");
  const monthly = buildMonthlyPerformanceCards(students.data || [], assessments.data || []);
  return <section className="performance-leaderboard"><header className="performance-head"><div><span className="eyebrow">متابعة المستوى</span><h2>ترتيب الطلاب وبطاقات الأداء</h2><p>يتحدّث الترتيب من درجات التقييمات المسجلة دون بيانات تجريبية.</p></div><button className="secondary" onClick={() => window.print()}><Printer size={16}/> طباعة التقرير</button></header><div className="performance-grid"><article className="panel leaderboard-card"><div className="performance-card-head"><div><Crown size={18}/><span>Leaderboard الأسبوعي</span></div><small>{weekly.length} طالب</small></div>{weekly.length ? <ol>{weekly.slice(0, 8).map((row, index) => <li key={row.studentId}><span className={index < 3 ? "leader-rank top" : "leader-rank"}>{index + 1}</span><div><b>{row.name}</b><small>{row.count} تقييمات</small></div><strong>{row.percentage}%</strong></li>)}</ol> : <div className="performance-empty">سجّل تقييمًا أسبوعيًا واحدًا على الأقل لعرض الترتيب.</div>}</article><article className="panel monthly-performance-card"><div className="performance-card-head"><div><TrendingUp size={18}/><span>بطاقات الشهر الحالي</span></div><small>{monthly.length} طالب</small></div>{monthly.length ? <div className="monthly-card-list">{monthly.slice(0, 6).map(row => <article key={row.studentId}><div><b>{row.name}</b><small>الترتيب {row.rank} · {row.status}</small></div><div className="performance-meter"><i style={{ width: `${row.percentage}%` }}/></div><strong>{row.percentage}%</strong></article>)}</div> : <div className="performance-empty">تظهر بطاقات الشهر عند رصد تقييمات شهرية.</div>}</article></div></section>;
}
