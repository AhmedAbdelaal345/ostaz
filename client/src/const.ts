export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Teacher sign-in is now managed by the application's phone/password portal.
// Keep this helper so existing actions and protected-page fallbacks reach the
// same controlled teacher authentication screen.
export const startLogin = () => {
  window.location.assign("/teacher/login");
};
