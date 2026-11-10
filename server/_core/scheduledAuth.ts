import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type ScheduledAuthorization = { taskUid: string | null };

export function hasValidCronSecret(req: Pick<Request, "headers">, expected = ENV.cronSecret) {
  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? "");
  if (!expected || expected.length < 32 || !match) return false;
  const actualBytes = Buffer.from(match[1]);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(actualBytes, expectedBytes);
}

/** Accept the new scheduler secret while retaining existing Heartbeat JWTs. */
export async function authorizeScheduledRequest(req: Request): Promise<ScheduledAuthorization | null> {
  if (hasValidCronSecret(req)) return { taskUid: null };

  try {
    const user = await sdk.authenticateRequest(req);
    if (user.isCron && user.taskUid) return { taskUid: user.taskUid };
  } catch {
    // Scheduled endpoints intentionally return a uniform 403 to callers.
  }
  return null;
}
