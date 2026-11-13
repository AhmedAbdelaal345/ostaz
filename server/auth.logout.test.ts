import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionState = vi.hoisted(() => ({ active: new Set<string>(), revoked: [] as string[] }));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    isAccountSessionActive: vi.fn(async ({ id }: { id: string }) => sessionState.active.has(id)),
    revokeAccountSession: vi.fn(async ({ id }: { id: string }) => {
      sessionState.active.delete(id);
      sessionState.revoked.push(id);
    }),
  };
});

import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import { createTeacherSession, getTeacherSession, TEACHER_SESSION_COOKIE } from "./teacherAuth";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  beforeEach(() => {
    sessionState.active.clear();
    sessionState.revoked.length = 0;
  });

  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(2);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[1]?.name).toBe(TEACHER_SESSION_COOKIE);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });

  it("revokes the teacher session and supports three repeated login/logout cycles", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      const sessionId = `00000000-0000-4000-8000-${String(cycle + 1).padStart(12, "0")}`;
      sessionState.active.add(sessionId);
      const token = await createTeacherSession({ accountId: 1, userId: 1, sessionId });
      ctx.req.headers.cookie = `${TEACHER_SESSION_COOKIE}=${token}`;

      await expect(caller.auth.logout()).resolves.toEqual({ success: true });
      expect(sessionState.active.has(sessionId)).toBe(false);
      expect(sessionState.revoked).toContain(sessionId);
      await expect(getTeacherSession(ctx.req)).resolves.toBeNull();
    }

    expect(clearedCookies.filter(cookie => cookie.name === TEACHER_SESSION_COOKIE)).toHaveLength(3);
  });
});
