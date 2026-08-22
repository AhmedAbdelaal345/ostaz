import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { flushOfflineQueue, offlineQueueSize } from "@/lib/offlineSync";

export function OfflineRuntime() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pending, setPending] = useState(() => offlineQueueSize());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const refresh = () => setPending(offlineQueueSize());
    const sync = async () => { setOnline(true); setSyncing(true); await flushOfflineQueue(); refresh(); setSyncing(false); };
    const offline = () => { setOnline(false); refresh(); };
    window.addEventListener("online", sync);
    window.addEventListener("offline", offline);
    window.addEventListener("ostazi-offline-queue-change", refresh);
    return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", offline); window.removeEventListener("ostazi-offline-queue-change", refresh); };
  }, []);

  if (online && !pending && !syncing) return <div className="offline-runtime online"><Cloud size={14}/><span>محفوظ ومتزامن</span></div>;
  return <div className={`offline-runtime ${online ? "syncing" : "offline"}`}>{online ? <RefreshCw size={14} className={syncing ? "spin" : ""}/> : <CloudOff size={14}/>}<span>{online ? (pending ? `جارٍ مزامنة ${pending} تعديل` : "جارٍ المزامنة") : `دون اتصال${pending ? ` · ${pending} تعديل محفوظ` : ""}`}</span></div>;
}
