import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientRuntime = readFileSync(new URL("../client/src/main.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("تمرير سياق التشغيل إلى إجراءات المعلم", () => {
  it("يضيف السياق المختار إلى طلبات القراءة والكتابة الأساسية قبل إرسالها أو وضعها في طابور الأوفلاين", () => {
    expect(clientRuntime).toContain("const workspaceScopedPath");
    expect(clientRuntime).toContain("const scopeTrpcRequest");
    expect(clientRuntime).toContain("workspaceScopedPath.test(source)");
    expect(clientRuntime).toContain("injectWorkspace(JSON.parse(nextInit.body), workspace)");
    expect(clientRuntime).toContain("url.searchParams.set(\"input\", JSON.stringify(injectWorkspace(decoded, workspace)))");
    expect(clientRuntime).toContain("enqueueTrpcRequest(String(scoped.input), scoped.init)");
  });

  it("لا يعرض أو يسجل السلوك خارج السياق المرسل", () => {
    expect(routers).toContain("behavior: router({ list: protectedProcedure.input(workspaceInput.optional())");
    expect(routers).toContain("listBehaviorRecords(ctx.user.id, input?.workspace ?? \"center\")");
    expect(routers).toContain("createBehaviorRecord(ctx.user.id, data, workspace ?? \"center\")");
  });

  it("يحجب أدوات السنتر المخصصة خارج السنتر حتى عند محاولة فتح رابط إعداد مباشر", () => {
    expect(app).toContain("const visibleTabs = workspace === \"center\" ? tabs");
    expect(app).toContain("[\"rewards\", \"rooms\", \"store\", \"team\"]");
    expect(app).toContain("هذه الأداة خاصة بالسنتر");
  });
});
