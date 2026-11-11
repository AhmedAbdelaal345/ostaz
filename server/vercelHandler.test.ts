import { createServer } from "node:http";
import type { AddressInfo, RequestListener } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import handler from "../serverless/vercelHandler.mjs";
import { createVercelHandler } from "./_core/vercelHandler";

describe("Vercel Node request handler", () => {
  let server: ReturnType<typeof createServer> | undefined;

  afterEach(async () => {
    if (!server?.listening) return;
    await new Promise<void>((resolve, reject) => server?.close(error => error ? reject(error) : resolve()));
    server = undefined;
  });

  it("preserves method, rewritten URL, headers, and body when forwarding", async () => {
    const application: RequestListener = async (request, response) => {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    };
    server = createServer(createVercelHandler(application));
    await new Promise<void>((resolve, reject) => {
      server?.once("error", reject);
      server?.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address() as AddressInfo;
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/handler?__vercel_path=trpc%2FteacherAuth.login&batch=1`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-check": "preserved" },
        body: JSON.stringify({ 0: { json: { phone: "", password: "" } } }),
      }
    );
    const forwarded = await response.json() as {
      method: string;
      url: string;
      headers: Record<string, string>;
      body: string;
    };

    expect(forwarded).toMatchObject({
      method: "POST",
      url: "/api/trpc/teacherAuth.login?batch=1",
      headers: { "content-type": "application/json", "x-forwarded-check": "preserved" },
      body: JSON.stringify({ 0: { json: { phone: "", password: "" } } }),
    });
  });

  it("routes health and nested paths through the bundled Express application", async () => {
    server = createServer(handler);
    await new Promise<void>((resolve, reject) => {
      server?.once("error", reject);
      server?.listen(0, "127.0.0.1", resolve);
    });
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const health = await fetch(`${base}/api/handler?__vercel_path=health`);
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ ok: true });

    const nested = await fetch(`${base}/api/handler?__vercel_path=health%2Ftest`);
    expect(nested.status).toBe(404);
    expect(nested.headers.get("content-type")).toContain("application/json");
    expect(await nested.json()).toEqual({ error: "API route not found" });
  });

  it.each([
    ["login", { phone: "", password: "" }],
    ["register", { phone: "", password: "", name: "", subject: "" }],
  ] as const)("routes tRPC %s POST batches through Express validation", async (procedure, input) => {
    server = createServer(handler);
    await new Promise<void>((resolve, reject) => {
      server?.once("error", reject);
      server?.listen(0, "127.0.0.1", resolve);
    });
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const url = new URL(`${base}/api/handler`);
    url.searchParams.set("__vercel_path", `trpc/teacherAuth.${procedure}`);
    url.searchParams.set("batch", "1");

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ 0: { json: input } }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty("[0].error.json.data.code", "BAD_REQUEST");
  });
});
