import { parse as parseCookies } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { ENV } from "./_core/env";

export const PARENT_SESSION_COOKIE = "ostazi_parent_session";
export const PARENT_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
type ParentSession = { accountId: number; userId: number };

function sessionSecret() { if (!ENV.cookieSecret) throw new Error("Parent session secret is not configured"); return new TextEncoder().encode(ENV.cookieSecret); }

export async function createParentSession(session: ParentSession) { return new SignJWT({ accountId: session.accountId, userId: session.userId, kind: "parent" }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuedAt().setExpirationTime(Math.floor((Date.now() + PARENT_SESSION_MAX_AGE_MS) / 1000)).sign(sessionSecret()); }
export async function getParentSession(req: Pick<Request, "headers">): Promise<ParentSession | null> { const token = parseCookies(req.headers.cookie || "")[PARENT_SESSION_COOKIE]; if (!token) return null; try { const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] }); const accountId = Number(payload.accountId); const userId = Number(payload.userId); if (payload.kind !== "parent" || !Number.isInteger(accountId) || !Number.isInteger(userId) || accountId < 1 || userId < 1) return null; return { accountId, userId }; } catch { return null; } }
