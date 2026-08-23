import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(user: TrpcContext["user"]): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

const user = { id: 42, openId: "security-user", name: "Teacher", email: "teacher@example.com", loginMethod: "test", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

describe("protected app procedures", () => {
  it("reject unauthenticated data access", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.app.groups.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.app.changeLog.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns a PDF payload only for an authenticated user", async () => {
    const caller = appRouter.createCaller(context(user));
    const result = await caller.report.pdf();
    expect(result.filename).toBe("ostazi-statistics.pdf");
    expect(result.contentBase64.startsWith("JVBER")).toBe(true);
  });
});
