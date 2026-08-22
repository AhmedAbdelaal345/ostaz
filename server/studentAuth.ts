import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { parse as parseCookies } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { ENV } from "./_core/env";

export const STUDENT_SESSION_COOKIE = "ostazi_student_session";
export const STUDENT_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type StudentSession = { accountId: number; studentId: number };

function sessionSecret() {
  if (!ENV.cookieSecret) throw new Error("Student session secret is not configured");
  return new TextEncoder().encode(ENV.cookieSecret);
}

function derivePasswordKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) return reject(error);
      resolve(Buffer.from(key));
    });
  });
}

export async function hashStudentPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derivePasswordKey(password, salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyStudentPassword(password: string, encodedHash: string) {
  const [algorithm, saltHex, keyHex] = encodedHash.split("$");
  if (algorithm !== "scrypt" || !saltHex || !keyHex) return false;
  try {
    const expected = Buffer.from(keyHex, "hex");
    const actual = await derivePasswordKey(password, Buffer.from(saltHex, "hex"));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export async function createStudentSession(session: StudentSession) {
  return new SignJWT({ accountId: session.accountId, studentId: session.studentId, kind: "student" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + STUDENT_SESSION_MAX_AGE_MS) / 1000))
    .sign(sessionSecret());
}

export async function getStudentSession(req: Pick<Request, "headers">): Promise<StudentSession | null> {
  const token = parseCookies(req.headers.cookie || "")[STUDENT_SESSION_COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] });
    const accountId = Number(payload.accountId);
    const studentId = Number(payload.studentId);
    if (payload.kind !== "student" || !Number.isInteger(accountId) || !Number.isInteger(studentId) || accountId < 1 || studentId < 1) return null;
    return { accountId, studentId };
  } catch {
    return null;
  }
}
