import { describe, expect, it, vi } from "vitest";
import {
  isTeacherApplicationPath,
  navigateAfterTeacherLogin,
  requiresTeacherSession,
  resolveRootRoute,
  TEACHER_APPLICATION_PATHS,
  TEACHER_SETTINGS_TABS,
} from "../client/src/lib/applicationRoutes";

describe("application route policy", () => {
  it("routes every teacher module and settings tab to the authenticated app", () => {
    for (const pathname of TEACHER_APPLICATION_PATHS) {
      expect(resolveRootRoute(pathname), pathname).toBe("app");
    }
    for (const tab of TEACHER_SETTINGS_TABS) {
      expect(resolveRootRoute(`/settings/${tab}`), tab).toBe("app");
    }
    expect(isTeacherApplicationPath("/groups/17")).toBe(false);
  });

  it("keeps role portals separate and sends unknown routes to not found", () => {
    expect(resolveRootRoute("/teacher/login")).toBe("teacher");
    expect(resolveRootRoute("/student/profile")).toBe("student");
    expect(resolveRootRoute("/parent/login")).toBe("parent");
    expect(resolveRootRoute("/groups/17")).toBe("entity");
    expect(resolveRootRoute("/teacher/unknown")).toBe("not-found");
    expect(resolveRootRoute("/settings/not-a-tab")).toBe("not-found");
    expect(resolveRootRoute("/does-not-exist")).toBe("not-found");
    expect(requiresTeacherSession("/student/profile")).toBe(false);
    expect(requiresTeacherSession("/parent/login")).toBe(false);
    expect(requiresTeacherSession("/teacher/login")).toBe(false);
    expect(requiresTeacherSession("/students/17")).toBe(true);
    expect(requiresTeacherSession("/groups")).toBe(true);
    expect(requiresTeacherSession("/does-not-exist")).toBe(false);
  });

  it("navigates to the dashboard only after the refreshed session is present", async () => {
    const navigate = vi.fn();
    const refreshSession = vi.fn().mockResolvedValue({ id: 42 });

    await expect(navigateAfterTeacherLogin(refreshSession, navigate)).resolves.toBe(true);
    expect(refreshSession).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("does not navigate when login did not establish a readable session", async () => {
    const navigate = vi.fn();
    const refreshSession = vi.fn().mockResolvedValue(null);

    await expect(navigateAfterTeacherLogin(refreshSession, navigate)).resolves.toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("does not navigate if refreshing the session fails", async () => {
    const navigate = vi.fn();
    const refreshSession = vi.fn().mockRejectedValue(new Error("network"));

    await expect(navigateAfterTeacherLogin(refreshSession, navigate)).rejects.toThrow("network");
    expect(navigate).not.toHaveBeenCalled();
  });
});
