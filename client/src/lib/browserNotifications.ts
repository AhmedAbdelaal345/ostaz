type AppNotification = {
  title: string;
  body: string;
  tag: string;
  url?: string;
  language: "ar" | "en";
};

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export async function getAppServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) throw new Error("SERVICE_WORKER_UNSUPPORTED");
  let registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  return registration;
}

export async function showAppNotification({ title, body, tag, url = "/", language }: AppNotification) {
  if (!isNotificationSupported()) throw new Error("NOTIFICATIONS_UNSUPPORTED");
  if (Notification.permission !== "granted") throw new Error("NOTIFICATION_PERMISSION_NOT_GRANTED");
  const registration = await getAppServiceWorkerRegistration();
  await registration.showNotification(title, {
    body,
    icon: "/manus-storage/el-mister-icon-192_c406f989.png",
    badge: "/manus-storage/el-mister-icon-192_c406f989.png",
    tag,
    data: { url },
    dir: language === "ar" ? "rtl" : "ltr",
    lang: language,
  });
}
