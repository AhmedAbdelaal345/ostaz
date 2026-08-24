import { useEffect, useState } from "react";
import { CheckCircle2, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { flushOfflineQueue, offlineQueueSize } from "@/lib/offlineSync";
import { getSyncStatus, syncStatusLabel } from "../../../shared/syncStatus";
import { useLanguage } from "@/contexts/LanguageContext";

export function OfflineRuntime() {
  const { language } = useLanguage();
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pending, setPending] = useState(() => offlineQueueSize());
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setPending(offlineQueueSize());
    const sync = async () => { setOnline(true); setSyncing(true); const before = offlineQueueSize(); const result = await flushOfflineQueue(); refresh(); setSyncing(false); const notice = language === "ar" ? (result.sent ? `تمت مزامنة ${result.sent} تعديل بنجاح` : result.pending ? `عاد الاتصال، وبقي ${result.pending} تعديل للمحاولة التالية` : before ? "عاد الاتصال وتمت مزامنة البيانات" : "عاد الاتصال والبيانات متزامنة") : (result.sent ? `${result.sent} change${result.sent === 1 ? "" : "s"} synced successfully` : result.pending ? `Connection restored; ${result.pending} change${result.pending === 1 ? "" : "s"} will retry` : before ? "Connection restored and data synced" : "Connection restored; data is in sync"); setSyncNotice(notice); window.setTimeout(() => setSyncNotice(null), 5_000); };
    const offline = () => { setOnline(false); refresh(); };
    window.addEventListener("online", sync);
    window.addEventListener("offline", offline);
    window.addEventListener("ostazi-offline-queue-change", refresh);
    if (navigator.onLine && offlineQueueSize()) void sync();
    return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", offline); window.removeEventListener("ostazi-offline-queue-change", refresh); };
  }, [language]);

  const status = getSyncStatus(online, pending, syncing);
  const label = language === "ar" ? syncStatusLabel(status, pending) : status === "online" ? "Synced" : status === "offline" ? (pending ? `${pending} change${pending === 1 ? "" : "s"} waiting` : "Offline") : "Syncing";
  const badge = <div className={`sync-status-icon ${status}`} role="status" aria-label={label} title={label}>{status === "online" ? <Cloud size={18}/> : status === "offline" ? <CloudOff size={18}/> : <RefreshCw size={18} className="spin"/>}<span className="sr-only">{label}</span></div>;
  return <>{badge}{syncNotice && <div className="offline-sync-notice" role="status"><CheckCircle2 size={18}/><div><b>{language === "ar" ? "تمت استعادة الاتصال" : "Connection restored"}</b><span>{syncNotice}</span></div></div>}</>;
}
