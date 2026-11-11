export const TEACHER_APPLICATION_PATHS = [
  "/",
  "/profile",
  "/reports",
  "/materials",
  "/assessments",
  "/finance",
  "/attendance",
  "/groups",
  "/students",
  "/year-work",
  "/behavior",
  "/timetable",
  "/stats",
  "/settings",
] as const;

export const TEACHER_SETTINGS_TABS = [
  "language",
  "reminders",
  "rewards",
  "learning",
  "video",
  "rooms",
  "store",
  "materials",
  "plans",
  "messages",
  "data",
  "payment",
  "contact",
  "security",
  "devices",
  "changes",
  "team",
  "notifications",
  "mode",
] as const;

export const STUDENT_PORTAL_PATHS = [
  "/student/login",
  "/student/register",
  "/student/profile",
  "/student/security",
  "/student/messages",
  "/student/community",
  "/student/videos",
  "/student/seats",
  "/student/store",
  "/student/materials",
  "/student/rewards",
] as const;

const teacherApplicationPaths = new Set<string>(TEACHER_APPLICATION_PATHS);
const teacherSettingsTabs = new Set<string>(TEACHER_SETTINGS_TABS);
const studentPortalPaths = new Set<string>(STUDENT_PORTAL_PATHS);

export function isTeacherApplicationPath(pathname: string): boolean {
  if (teacherApplicationPaths.has(pathname)) return true;
  const settingsTab = /^\/settings\/([^/]+)$/.exec(pathname)?.[1];
  return settingsTab ? teacherSettingsTabs.has(settingsTab) : false;
}

export type RootRoute = "platform" | "student" | "parent" | "teacher" | "entity" | "app" | "not-found";

export function resolveRootRoute(pathname: string): RootRoute {
  if (pathname === "/platform") return "platform";
  if (studentPortalPaths.has(pathname)) return "student";
  if (pathname === "/parent/login") return "parent";
  if (pathname === "/teacher/login" || pathname === "/teacher/register") return "teacher";
  if (/^\/(students|groups)\/\d+$/.test(pathname)) return "entity";
  if (isTeacherApplicationPath(pathname)) return "app";
  return "not-found";
}

export function requiresTeacherSession(pathname: string): boolean {
  const route = resolveRootRoute(pathname);
  return route === "app" || route === "entity";
}

export async function navigateAfterTeacherLogin<T>(
  refreshSession: () => Promise<T | null | undefined>,
  navigate: (path: string) => void,
): Promise<boolean> {
  const session = await refreshSession();
  if (!session) return false;
  navigate("/");
  return true;
}
