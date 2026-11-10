import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./_core/app";

describe("serverless Express application", () => {
  let server: ReturnType<typeof createServer> | undefined;

  afterEach(async () => {
    if (!server?.listening) return;
    await new Promise<void>((resolve, reject) => server?.close(error => error ? reject(error) : resolve()));
    server = undefined;
  });

  it("returns JSON for health, tRPC, and unknown API requests", async () => {
    server = createServer(createApp());
    await new Promise<void>((resolve, reject) => {
      server?.once("error", reject);
      server?.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address() as AddressInfo;
    const base = `http://127.0.0.1:${address.port}`;

    const health = await fetch(`${base}/api/health`);
    expect(health.status).toBe(200);
    expect(health.headers.get("content-type")).toContain("application/json");
    expect(await health.json()).toEqual({ ok: true });

    const trpc = await fetch(`${base}/api/trpc/auth.me?input=${encodeURIComponent(JSON.stringify({ json: null }))}`);
    expect(trpc.status).toBe(200);
    expect(trpc.headers.get("content-type")).toContain("application/json");
    expect(await trpc.json()).toHaveProperty("result.data.json", null);

    const missing = await fetch(`${base}/api/does-not-exist`);
    expect(missing.status).toBe(404);
    expect(missing.headers.get("content-type")).toContain("application/json");
    expect(await missing.json()).toEqual({ error: "API route not found" });

    const unauthorizedCron = await fetch(`${base}/api/scheduled/personal-reminders`, { method: "POST" });
    expect(unauthorizedCron.status).toBe(403);
    expect(unauthorizedCron.headers.get("content-type")).toContain("application/json");
    expect(await unauthorizedCron.json()).toEqual({ error: "cron-only" });
  });
});
