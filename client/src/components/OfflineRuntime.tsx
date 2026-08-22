import { useEffect, useState } from "react";
import { CheckCircle2, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { flushOfflineQueue, offlineQueueSize } from "@/lib/offlineSync";

export function OfflineRuntime() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pending, setPending] = useState(() => offlineQueueSize());
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setPending(offlineQueueSize());
    const sync = async () => { setOnline(true); setSyncing(true); const before = offlineQueueSize(); const result = await flushOfflineQueue(); refresh(); setSyncing(false); const notice = result.sent ? `تمت مزامنة ${result.sent} تعديل بنجاح` : result.pending ? `عاد الاتصال، وبقي ${result.pending} تعديل للمحاولة التالية` : before ? "عاد الاتصال وتمت مزامنة البيانات" : "عاد الاتصال والبيانات متزامنة"; setSyncNotice(notice); window.setTimeout(() => setSyncNotice(null), 5_000); };
    const offline = () => { setOnline(false); refresh(); };
    window.addEventListener("online", sync);
    window.addEventListener("offline", offline);
    window.addEventListener("ostazi-offline-queue-change", refresh);
    return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", offline); window.removeEventListener("ostazi-offline-queue-change", refresh); };
  }, []);

  const badge = online && !pending && !syncing ? <div className="offline-runtime online"><Cloud size={14}/><span>محفوظ ومتزامن</span></div> : <div className={`offline-runtime ${online ? "syncing" : "offline"}`}>{online ? <RefreshCw size={14} className={syncing ? "spin" : ""}/> : <CloudOff size={14}/>}<span>{online ? (pending ? `جارٍ مزامنة ${pending} تعديل` : "جارٍ المزامنة") : `دون اتصال${pending ? ` · ${pending} تعديل محفوظ` : ""}`}</span></div>;
  return <>{badge}{syncNotice && <div className="offline-sync-notice" role="status"><CheckCircle2 size={18}/><div><b>تمت استعادة الاتصال</b><span>{syncNotice}</span></div></div>}</>;
}
