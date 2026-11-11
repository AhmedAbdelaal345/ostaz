import { describe, expect, it } from "vitest";
import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./_core/app";
import { restoreVercelApiPath } from "./_core/vercelRequest";

describe("Vercel API path forwarding", () => {
  let server: ReturnType<typeof createServer> | undefined;

  afterEach(async () => {
    if (!server?.listening) return;
    await new Promise<void>((resolve, reject) => server?.close(error => error ? reject(error) : resolve()));
    server = undefined;
  });

  it("forwards nested health and tRPC paths through the shared Express app", async () => {
    const gateway = express();
    gateway.use((req, _res, next) => {
      restoreVercelApiPath(req);
      next();
    });
    gateway.use(createApp());
    server = createServer(gateway);
    await new Promise<void>((resolve, reject) => {
      server?.once("error", reject);
      server?.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address() as AddressInfo;
    const base = `http://127.0.0.1:${address.port}`;
    const health = await fetch(`${base}/api/handler?__vercel_path=health`);
    expect(health.status).toBe(200);
    expect(health.headers.get("cache-control")).toContain("no-store");
    expect(await health.json()).toEqual({ ok: true });

    const nestedHealth = await fetch(`${base}/api/handler?__vercel_path=health%2Ftest`);
    expect(nestedHealth.status).toBe(404);
    expect(nestedHealth.headers.get("content-type")).toContain("application/json");
    expect(await nestedHealth.json()).toEqual({ error: "API route not found" });

    const trpcRoot = await fetch(`${base}/api/handler?__vercel_path=trpc`);
    expect(trpcRoot.status).toBe(404);
    expect(trpcRoot.headers.get("content-type")).toContain("application/json");
    expect(await trpcRoot.json()).toHaveProperty("error.json.data.path", "");

    const trpcTeacherRoot = await fetch(`${base}/api/handler?__vercel_path=trpc%2FteacherAuth&batch=1`);
    expect(trpcTeacherRoot.status).toBe(404);
    expect(trpcTeacherRoot.headers.get("content-type")).toContain("application/json");
    expect(Array.isArray(await trpcTeacherRoot.json())).toBe(true);

    for (const procedure of ["login", "register"] as const) {
      const input = procedure === "login"
        ? { phone: "", password: "" }
        : { phone: "", password: "", name: "", subject: "" };
      const result = await fetch(`${base}/api/handler?__vercel_path=trpc%2FteacherAuth.${procedure}&batch=1`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 0: { json: input } }),
      });
      expect(result.status).toBe(400);
      expect(result.headers.get("content-type")).toContain("application/json");
      expect((await result.json())[0]).toHaveProperty("error.json");
    }
  });
});
