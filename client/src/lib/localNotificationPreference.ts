import { useEffect, useState } from "react";

const PREFERENCE_KEY = "el-mister-local-notifications-enabled";
const PREFERENCE_EVENT = "el-mister-local-notifications-preference-change";

function browserPermissionGranted() {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

export function readLocalNotificationPreference() {
  try {
    const saved = localStorage.getItem(PREFERENCE_KEY);
    if (saved === "true") return true;
    if (saved === "false") return false;
  } catch {
    // Use permission as a safe default when browser storage is unavailable.
  }
  return browserPermissionGranted();
}

export function writeLocalNotificationPreference(enabled: boolean) {
  try {
    localStorage.setItem(PREFERENCE_KEY, String(enabled));
  } catch {
    // The setting still applies for this tab if storage is blocked.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PREFERENCE_EVENT, { detail: { enabled } }));
  }
}

export function useLocalNotificationPreference() {
  const [enabled, setEnabled] = useState(readLocalNotificationPreference);

  useEffect(() => {
    const update = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail?.enabled === "boolean") {
        setEnabled(event.detail.enabled);
      } else {
        setEnabled(readLocalNotificationPreference());
      }
    };
    window.addEventListener(PREFERENCE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(PREFERENCE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return [enabled, writeLocalNotificationPreference] as const;
}
