export type SyncStatus = "online" | "syncing" | "offline";

export function getSyncStatus(online: boolean, pending: number, syncing: boolean): SyncStatus {
  if (!online) return "offline";
  if (syncing || pending > 0) return "syncing";
  return "online";
}

export function syncStatusLabel(status: SyncStatus, pending = 0): string {
  if (status === "offline") return pending ? `دون اتصال، ${pending} تعديل محفوظ محليًا` : "دون اتصال";
  if (status === "syncing") return pending ? `جارٍ مزامنة ${pending} تعديل` : "جارٍ المزامنة";
  return "محفوظ ومتزامن";
}
