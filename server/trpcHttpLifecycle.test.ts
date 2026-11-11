import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "./routers";
import { createApp } from "./_core/app";
import { restoreVercelApiPath } from "./_core/vercelRequest";

describe("tRPC Express request lifecycle", () => {
  let server: ReturnType<typeof createServer> | undefined;

  afterEach(async () => {
    if (!server?.listening) return;
    await new Promise<void>((resolve, reject) => server?.close(error => error ? reject(error) : resolve()));
    server = undefined;
  });

  it("accepts the frontend httpBatchLink login and registration wire format through the Vercel rewrite", async () => {
    const gateway = express();
    gateway.use((req, _res, next) => {
      const url = new URL(req.url ?? "/", "http://vercel.local");
      if (url.pathname.startsWith("/api/") && url.pathname !== "/api/handler") {
        const path = url.pathname.slice("/api/".length);
        url.pathname = "/api/handler";
        url.searchParams.set("__vercel_path", path);
        req.url = `${url.pathname}${url.search}`;
      }
      restoreVercelApiPath(req);
      next();
    });
    gateway.use(createApp());
    server = createServer(gateway);
    await new Promise<void>((resolve, reject) => {
      server?.once("error", reject);
      server?.listen(0, "127.0.0.1", resolve);
    });

    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    let captured: {
      url: string;
      method: string | undefined;
      contentType: string | null;
      body: unknown;
      status: number;
      responseBody: unknown;
    } | undefined;
    const client = createTRPCProxyClient<AppRouter>({
      links: [httpBatchLink({
        url: `${base}/api/trpc`,
        transformer: superjson,
        fetch: async (input, init) => {
          const response = await globalThis.fetch(input, init);
          let body: unknown;
          try {
            body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
          } catch {
            body = init?.body;
          }
          let responseBody: unknown;
          try {
            responseBody = await response.clone().json();
          } catch {
            responseBody = undefined;
          }
          captured = {
            url: String(input),
            method: init?.method,
            contentType: new Headers(init?.headers).get("content-type"),
            body,
            status: response.status,
            responseBody,
          };
          return response;
        },
      })],
    });

    for (const procedure of ["login", "register"] as const) {
      const call = procedure === "login"
        ? client.teacherAuth.login.mutate({ phone: "", password: "" })
        : client.teacherAuth.register.mutate({ phone: "", password: "", name: "", subject: "" });
      await expect(call).rejects.toBeInstanceOf(TRPCClientError);

      expect(captured).toMatchObject({
        method: "POST",
        contentType: "application/json",
        body: { 0: { json: procedure === "login"
          ? { phone: "", password: "" }
          : { phone: "", password: "", name: "", subject: "" } } },
        status: 400,
      });
      expect(new URL(captured!.url).searchParams.get("batch")).toBe("1");
      expect(captured!.url).toContain(`/api/trpc/teacherAuth.${procedure}`);
      expect(captured!.responseBody).toHaveProperty("[0].error.json.data.code", "BAD_REQUEST");
      expect(captured!.responseBody).not.toEqual({ error: "Invalid request" });
    }
  });

  it("shows that the generic Invalid request response comes from Express JSON parser errors", async () => {
    const app = createApp();
    server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server?.once("error", reject);
      server?.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}/api/trpc/teacherAuth.login?batch=1`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid request" });
  });
});
