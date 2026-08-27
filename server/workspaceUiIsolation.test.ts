import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const leaderboard = readFileSync(new URL("../client/src/components/PerformanceLeaderboard.tsx", import.meta.url), "utf8");

describe("تحميل واجهة السياق النشط", () => {
  it("يربط bootstrap بالسياق النشط ولا يعيد مراقبة DOM", () => {
    expect(app).toContain("trpc.app.bootstrap.useQuery(");
    expect(app).toContain("{ workspace },");
    expect(app).not.toContain("MutationObserver");
    expect(app).toContain("setGroups(groupRows)");
  });

  it("لا يحمل الحضور أو المالية أو التقييمات من صفحة المجموعات", () => {
    expect(app).toContain('location === "/attendance" || location === "/reports"');
    expect(app).not.toContain('location === "/groups" || location === "/reports"');
    expect(app).toContain('location === "/finance"');
    expect(app).toContain('location === "/assessments"');
  });

  it("يقيد لوحة ترتيب الأداء بالمدرسة أو السنتر أو الأونلاين النشط", () => {
    expect(leaderboard).toContain("const [workspace] = useWorkspace()");
    expect(leaderboard).toContain("students.list.useQuery({ workspace })");
    expect(leaderboard).toContain("assessments.list.useQuery({ workspace })");
  });

  it("يبقي روابط Wouter ذات المحتوى القديم رابطًا واحدًا صالحًا", () => {
    expect(app).toContain('Link as WouterLink');
    expect(app).toContain('if (isValidElement(children) && children.type === "a")');
    expect(app).toContain("return cloneElement(child");
  });
});
