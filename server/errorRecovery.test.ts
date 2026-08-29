import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("استرداد أخطاء الواجهة", () => {
  it("يعرض مسار استرداد واضحًا بدلاً من صفحة فارغة", () => {
    const boundary = readFileSync(resolve(process.cwd(), "client/src/components/ErrorBoundary.tsx"), "utf8");
    expect(boundary).toContain("app-recovery-screen");
    expect(boundary).toContain("العودة للرئيسية");
    expect(boundary).toContain('window.location.assign("/")');
    expect(boundary).toContain("[App recovery]");
  });

  it("يحمي معالجات الواجهة من أهداف DOM غير القابلة لاستدعاء closest", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(app).toContain("if (!(target instanceof Element)) return false;");
    expect(app).toContain('target.closest(\n        "input, textarea, select, [contenteditable=\'true\']"');
  });
});
