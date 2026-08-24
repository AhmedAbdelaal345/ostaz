import { parse as parseCookies } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { isAccountSessionActive } from "./db";
import { ENV } from "./_core/env";

export const TEACHER_SESSION_COOKIE = "ostazi_teacher_session";
export const TEACHER_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type TeacherSession = { accountId: number; userId: number; sessionId?: string };

function sessionSecret() {
  if (!ENV.cookieSecret) throw new Error("Teacher session secret is not configured");
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function createTeacherSession(session: Required<TeacherSession>) {
  return new SignJWT({ accountId: session.accountId, userId: session.userId, sessionId: session.sessionId, kind: "teacher" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + TEACHER_SESSION_MAX_AGE_MS) / 1000))
    .sign(sessionSecret());
}

export async function getTeacherSession(req: Pick<Request, "headers">): Promise<TeacherSession | null> {
  const token = parseCookies(req.headers.cookie || "")[TEACHER_SESSION_COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] });
    const accountId = Number(payload.accountId);
    const userId = Number(payload.userId);
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : undefined;
    if (payload.kind !== "teacher" || !Number.isInteger(accountId) || !Number.isInteger(userId) || accountId < 1 || userId < 1) return null;
    if (sessionId && !(await isAccountSessionActive({ id: sessionId, accountType: "teacher", accountId }))) return null;
    return { accountId, userId, sessionId };
  } catch {
    return null;
  }
}
