import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const main = readFileSync(new URL("../client/src/main.tsx", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("أداء تبديل سياق التشغيل", () => {
  it("يجلب المجموعات والطلاب بالتوازي ضمن السياق المصرح به", () => {
    expect(routers).toContain("Promise.all([listGroups(scope.dataUserId, workspace), listStudents(scope.dataUserId, workspace)])");
  });

  it("يحمّل السياقات الأخرى مسبقًا ويحفظ السياق المطلوب صراحةً", () => {
    expect(app).toContain("utils.app.bootstrap.prefetch(");
    expect(app).toContain("workspace: next");
    expect(app).toContain("staleTime: WORKSPACE_CACHE_MS");
    expect(main).toContain('Object.prototype.hasOwnProperty.call(payload, "workspace")');
  });

  it("يمنع ضغطات تبديل متداخلة ويعرض حالة تجهيز آمنة بدل تفريغ بيانات السياق", () => {
    expect(app).toContain("const [switchingTo, setSwitchingTo]");
    expect(app).toContain("if (next === workspace || switchingTo) return");
    expect(app).toContain('sessionStorage.setItem("ostazi-workspace-switching"');
    expect(app).toContain('sessionStorage.removeItem("ostazi-workspace-switching")');
    expect(app).toContain('window.addEventListener("ostazi-workspace-ready", finish)');
    expect(app).toContain('loadedWorkspace !== workspace');
    expect(app).toContain('className="workspace-loading"');
  });

  it("لا يعيد من صفحة السياق قبل اكتمال Hooks حتى لا يتعطل React عند اكتمال التحميل", () => {
    const loadingState = app.indexOf("const isWorkspaceLoading");
    const lastPageEffect = app.indexOf("window.addEventListener(\"ostazi-group-sort-change\"");
    const loadingReturn = app.indexOf("if (isWorkspaceLoading)");
    expect(loadingState).toBeGreaterThan(lastPageEffect);
    expect(loadingReturn).toBeGreaterThan(lastPageEffect);
  });

  it("يختار بوابة التطبيق من المسار التفاعلي ولا يوجّه إلى الدخول أثناء تبديل أوفلاين مؤقت", () => {
    expect(main).toContain("function RootRouter()");
    expect(main).toContain("const [pathname] = useLocation()");
    expect(main).toContain("<ErrorBoundary><DirectAccessGuard>");
    expect(main).toContain("!navigator.onLine || workspaceSwitchIsActive()");
  });
});
