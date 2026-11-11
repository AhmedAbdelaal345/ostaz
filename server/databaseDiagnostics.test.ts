import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { publicProcedure, router as createRouter } from "./_core/trpc";
import { logServerError, withDatabaseErrorLogging, type DiagnosticRequest } from "./_core/databaseDiagnostics";

describe("database error diagnostics", () => {
  let server: ReturnType<typeof createServer> | undefined;

  afterEach(() => vi.restoreAllMocks());

  afterEach(async () => {
    if (!server?.listening) return;
    await new Promise<void>((resolve, reject) => server?.close(error => error ? reject(error) : resolve()));
    server = undefined;
  });

  it("logs safe database metadata and rethrows the original error unchanged", async () => {
    const logger = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const databaseError = Object.assign(
      new Error("Table 'talat_app.teacher_accounts' doesn't exist"),
      { code: "ER_NO_SUCH_TABLE", errno: 1146, sqlState: "42S02" },
    );
    const originalError = Object.assign(
      new Error("Failed query: SELECT * FROM teacher_accounts WHERE phone = ? params: 01069683875,1", {
        cause: databaseError,
      }),
      { name: "DrizzleQueryError" },
    );
    const request = {
      path: "/api/trpc/teacherAuth.register",
      headers: { "x-vercel-id": "fra1::request-id" },
    } satisfies DiagnosticRequest;

    await expect(withDatabaseErrorLogging(
      () => Promise.reject(originalError),
      request,
      "teacher_register_account_lookup_failed",
    )).rejects.toBe(originalError);

    expect(logger).toHaveBeenCalledOnce();
    const [eventName, details] = logger.mock.calls[0];
    expect(eventName).toBe("[Server] teacher_register_account_lookup_failed");
    expect(details).toMatchObject({
      requestPath: "/api/trpc/teacherAuth.register",
      vercelRequestId: "fra1::request-id",
      errorName: "DrizzleQueryError",
      rootCauseName: "Error",
      databaseErrorCode: "ER_NO_SUCH_TABLE",
      databaseErrno: 1146,
      databaseSqlState: "42S02",
      connectionStatus: "database_server_responded",
      errorMessage: "Table 'talat_app.teacher_accounts' doesn't exist",
    });
    expect(details).toHaveProperty("stackTrace");

    const serializedLog = JSON.stringify(logger.mock.calls);
    expect(serializedLog).not.toContain("01069683875");
    expect(serializedLog).not.toContain("params:");
    expect(serializedLog).not.toContain("Failed query:");
    expect(serializedLog).not.toMatch(/mysql:\/\/[^\s]+/);
  });

  it("returns a generic tRPC error message for internal database failures", async () => {
    const internalError = new Error(
      "Failed query: SELECT * FROM teacher_accounts WHERE phone = ? params: 01069683875,1",
    );
    const testRouter = createRouter({
      registration: publicProcedure.query(() => { throw internalError; }),
    });
    const app = express();
    app.use("/api/trpc", createExpressMiddleware({
      router: testRouter,
      createContext: ({ req, res }) => ({ req, res, user: null }),
    }));
    server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server?.once("error", reject);
      server?.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}/api/trpc/registration`);
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body).toHaveProperty("error.json.message", "Internal server error");
    expect(JSON.stringify(body)).not.toContain("teacher_accounts");
    expect(JSON.stringify(body)).not.toContain("01069683875");
  });

  it("redacts credentials and connection URLs from server diagnostics", () => {
    const logger = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = new Error(
      "Access denied for user 'dbuser'@'dbhost' password=supersecret mysql://dbuser:supersecret@dbhost/proddb?token=private",
    );
    const request = {
      path: "/api/trpc/teacherAuth.register",
      headers: {},
    } satisfies DiagnosticRequest;

    logServerError(error, request, "database_connection_failed");

    const serializedLog = JSON.stringify(logger.mock.calls);
    expect(serializedLog).not.toContain("dbuser");
    expect(serializedLog).not.toContain("supersecret");
    expect(serializedLog).not.toContain("mysql://");
    expect(serializedLog).not.toContain("private");
    expect(serializedLog).toContain("[redacted-url]");
  });
});
