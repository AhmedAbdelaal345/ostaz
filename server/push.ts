import webpush from "web-push";
import { listPushSubscriptions, deletePushSubscription } from "./db";
import { ENV } from "./_core/env";

export function isPushConfigured() {
  return Boolean(ENV.vapidPublicKey && ENV.vapidPrivateKey && ENV.vapidSubject);
}

export function getPushPublicKey() {
  if (!isPushConfigured()) throw new Error("PUSH_NOT_CONFIGURED");
  return ENV.vapidPublicKey;
}

export async function sendPushToUser(userId: number, payload: { title: string; body: string; url?: string }) {
  if (!isPushConfigured()) throw new Error("PUSH_NOT_CONFIGURED");
  webpush.setVapidDetails(ENV.vapidSubject, ENV.vapidPublicKey, ENV.vapidPrivateKey);
  const subscriptions = await listPushSubscriptions(userId);
  let delivered = 0; let failed = 0;
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify(payload), { contentEncoding: subscription.contentEncoding as "aes128gcm" });
      delivered += 1;
    } catch (error: any) {
      failed += 1;
      if (error?.statusCode === 404 || error?.statusCode === 410) await deletePushSubscription(userId, subscription.endpoint);
      else console.warn("[Push] delivery failed", userId, error?.statusCode || error?.message || error);
    }
  }
  return { delivered, failed, subscriptions: subscriptions.length };
}
