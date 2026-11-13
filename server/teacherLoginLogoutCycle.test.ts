import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  activeSessions: new Set<string>(),
  account: null as null | { id: number; userId: number; phone: string; passwordHash: string },
  user: null as null | Record<string, unknown>,
  revoked: [] as string[],
}));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getTeacherAccountByPhone: vi.fn(async () => state.account),
    getTeacherProfile: vi.fn(async () => ({ name: "Test Teacher", subject: "Math" })),
    getUserById: vi.fn(async () => state.user),
    createAccountSession: vi.fn(async () => {
      const id = crypto.randomUUID();
      state.activeSessions.add(id);
      return id;
    }),
    touchTeacherAccount: vi.fn(async () => undefined),
    isAccountSessionActive: vi.fn(async ({ id }: { id: string }) => state.activeSessions.has(id)),
    revokeAccountSession: vi.fn(async ({ id }: { id: string }) => {
      state.activeSessions.delete(id);
      state.revoked.push(id);
    }),
  };
});

vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: vi.fn(async () => { throw new Error("No OAuth session"); }) },
}));

import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { hashStudentPassword } from "./studentAuth";
import { getTeacherSession, TEACHER_SESSION_COOKIE } from "./teacherAuth";
import type { TrpcContext } from "./_core/context";

describe("teacher authentication lifecycle", () => {
  beforeEach(async () => {
    state.activeSessions.clear();
    state.revoked.length = 0;
    state.user = {
      id: 41,
      openId: "test-teacher",
      email: null,
      name: "Test Teacher",
      loginMethod: "phone",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    state.account = {
      id: 23,
      userId: 41,
      phone: "01000000000",
      passwordHash: await hashStudentPassword("correct horse battery staple"),
    };
  });

  it("survives three login, refresh, logout, and login-again cycles", async () => {
    const issuedCookies: string[] = [];
    const clearedCookies: string[] = [];
    const req = {
      protocol: "https",
      headers: { host: "ostaz-one.vercel.app", cookie: "" },
    } as TrpcContext["req"];
    const res = {
      cookie: (name: string, value: string) => {
        if (name === TEACHER_SESSION_COOKIE) issuedCookies.push(value);
      },
      clearCookie: (name: string) => clearedCookies.push(name),
    } as TrpcContext["res"];

    for (let cycle = 0; cycle < 3; cycle += 1) {
      const publicContext: TrpcContext = { req, res, user: null };
      const login = appRouter.createCaller(publicContext).teacherAuth.login;
      await expect(login({ phone: "01000000000", password: "correct horse battery staple" }))
        .resolves.toMatchObject({ success: true });

      const token = issuedCookies[issuedCookies.length - 1];
      expect(token).toBeTruthy();
      req.headers.cookie = `${TEACHER_SESSION_COOKIE}=${token}`;

      // A page refresh rebuilds the tRPC context from the persisted cookie.
      const refreshedContext = await createContext({ req, res });
      const authenticatedCaller = appRouter.createCaller(refreshedContext);
      await expect(authenticatedCaller.auth.me()).resolves.toMatchObject({ id: 41 });
      const active = await getTeacherSession(req);
      expect(active?.sessionId).toBeTruthy();

      await expect(authenticatedCaller.auth.logout()).resolves.toEqual({ success: true });
      expect(clearedCookies).toContain(TEACHER_SESSION_COOKIE);
      expect(state.revoked).toContain(active?.sessionId);
      await expect(getTeacherSession(req)).resolves.toBeNull();

      req.headers.cookie = "";
      const loggedOutContext = await createContext({ req, res });
      await expect(appRouter.createCaller(loggedOutContext).auth.me()).resolves.toBeNull();
    }

    expect(issuedCookies).toHaveLength(3);
    expect(clearedCookies.filter(name => name === TEACHER_SESSION_COOKIE)).toHaveLength(3);
  });
});
