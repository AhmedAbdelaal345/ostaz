import type { Request } from "express";

export type DiagnosticRequest = Pick<Request, "path" | "headers">;

function errorChain(error: unknown): Error[] {
  const chain: Error[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current instanceof Error && !seen.has(current) && chain.length < 4) {
    chain.push(current);
    seen.add(current);
    current = "cause" in current ? current.cause : undefined;
  }
  return chain;
}

function sanitizeMessage(value: string): string {
  if (/failed query:/i.test(value)) return "Database query failed";
  return value
    .replace(/\bparams?\s*:[\s\S]*$/i, "parameters: [redacted]")
    .replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s'"<>]+/gi, "[redacted-url]")
    .replace(/Access denied for user ['"][^'"]+['"]@['"][^'"]+['"]/gi, "Access denied for user [redacted]")
    .replace(/\b[\w.+-]+:[^/\\\s@]+@[A-Za-z0-9.-]+(?::\d+)?/g, "[redacted-credential]")
    .replace(/\bBearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/\b(password|token|secret|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .replace(/(^|\D)\+?\d[\d\s().-]{6,}\d(?!\w)/g, "$1[redacted-number]")
    .replace(/[\r\n\t]/g, " ")
    .slice(0, 500);
}

function safeRequestId(request: DiagnosticRequest): string | undefined {
  const value = request.headers["x-vercel-id"] ?? request.headers["x-vercel-request-id"];
  const requestId = Array.isArray(value) ? value[0] : value;
  return requestId?.slice(0, 200);
}

export function safeDatabaseTarget() {
  const value = process.env.DATABASE_URL;
  if (!value) return { host: "unconfigured", database: "unconfigured" };
  try {
    const url = new URL(value);
    return {
      host: url.hostname,
      database: decodeURIComponent(url.pathname.replace(/^\/+/, "")) || "unknown",
    };
  } catch {
    return { host: "unparseable", database: "unparseable" };
  }
}

export function logServerError(error: unknown, request: DiagnosticRequest, event: string): void {
  const chain = errorChain(error);
  const originalError = chain[0];
  const rootError = chain.at(-1);
  const databaseFields = [...chain].reverse().find(item => {
    const candidate = item as Error & { code?: unknown; errno?: unknown; sqlState?: unknown };
    return candidate.code !== undefined || candidate.errno !== undefined || candidate.sqlState !== undefined;
  }) as (Error & { code?: unknown; errno?: unknown; sqlState?: unknown }) | undefined;
  const errorCode = typeof databaseFields?.code === "string" ? databaseFields.code : undefined;
  const errno = typeof databaseFields?.errno === "number" ? databaseFields.errno : undefined;
  const sqlState = typeof databaseFields?.sqlState === "string" ? databaseFields.sqlState : undefined;
  const stackTrace = chain
    .flatMap(item => (item.stack ?? "").split("\n").slice(1))
    .filter(line => /^\s*at\s/.test(line))
    .map(sanitizeMessage)
    .slice(0, 20)
    .join("\n");

  console.error(`[Server] ${event}`, {
    requestPath: request.path,
    ...(safeRequestId(request) ? { vercelRequestId: safeRequestId(request) } : {}),
    errorName: sanitizeMessage(originalError?.name ?? "UnknownError"),
    ...(rootError && rootError !== originalError ? { rootCauseName: sanitizeMessage(rootError.name) } : {}),
    ...(errorCode ? { databaseErrorCode: errorCode } : {}),
    ...(errno !== undefined ? { databaseErrno: errno } : {}),
    ...(sqlState ? { databaseSqlState: sqlState } : {}),
    connectionStatus: errno !== undefined ? "database_server_responded" : "not_confirmed",
    databaseTarget: safeDatabaseTarget(),
    errorMessage: sanitizeMessage(rootError?.message ?? originalError?.message ?? "Unknown error"),
    ...(stackTrace ? { stackTrace } : {}),
  });
}

export async function withDatabaseErrorLogging<T>(
  operation: () => Promise<T>,
  request: DiagnosticRequest,
  event: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logServerError(error, request, event);
    throw error;
  }
}
