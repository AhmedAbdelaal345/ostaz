import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { shouldConfirmPushDelivery } from "../shared/pushDelivery";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const studentPortal = readFileSync(new URL("../client/src/pages/StudentPortal.tsx", import.meta.url), "utf8");

describe("push delivery confirmation", () => {
  it("does not consume a reminder when no subscription accepts the push", () => {
    expect(shouldConfirmPushDelivery({ delivered: 0, subscriptions: 0 })).toBe(false);
    expect(shouldConfirmPushDelivery({ delivered: 0, subscriptions: 1, failed: 1 })).toBe(false);
  });

  it("confirms only after the push provider accepts a subscription", () => {
    expect(shouldConfirmPushDelivery({ delivered: 1, subscriptions: 1 })).toBe(true);
  });

  it("يفصل أجهزة الطلاب عن اشتراكات المعلم ويربط الإرسال بمجموعة الطالب فقط", () => {
    expect(dbSource).toContain("saveStudentPushSubscription(studentId: number");
    expect(dbSource).toContain('accountType: "student" as const');
    expect(dbSource).toContain("listStudentPushSubscriptions(userId: number, groupId: number)");
    expect(routerSource).toContain("sendPushToGroupStudents(scope.dataUserId, data.groupId");
    expect(routerSource).toContain("studentSubscribe: publicProcedure");
    expect(studentPortal).toContain("studentPushSubscribe.mutateAsync");
  });
});
