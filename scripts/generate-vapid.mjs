import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log(JSON.stringify({
  VAPID_PUBLIC_KEY: keys.publicKey,
  VAPID_PRIVATE_KEY: keys.privateKey,
  VAPID_SUBJECT: "mailto:admin@example.com",
}, null, 2));
