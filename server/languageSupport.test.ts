import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("دعم العربية والإنجليزية", () => {
  it("يحفظ اللغة ويضبط الاتجاه ويعرض مبدّلًا في التطبيق والإعدادات", () => {
    const context = readFileSync(new URL("../client/src/contexts/LanguageContext.tsx", import.meta.url), "utf8");
    const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
    const main = readFileSync(new URL("../client/src/main.tsx", import.meta.url), "utf8");
    expect(context).toContain('localStorage.setItem("el-mister-language", language)');
    expect(context).toContain('document.documentElement.dir = isRtl ? "rtl" : "ltr"');
    expect(context).toContain('en: {');
    expect(context).toContain("const pendingRoots = new Set<Node>()");
    expect(context).toContain("records.forEach(record =>");
    expect(context).toContain("record.addedNodes.forEach(schedule)");
    expect(main).toContain("<LanguageProvider>");
    expect(app).toContain("Globe2");
    expect(app).toContain('id === "language"');
    expect(app).toContain('dir={isRtl ? "rtl" : "ltr"}');
  });
});
