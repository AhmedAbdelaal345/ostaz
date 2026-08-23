import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("عزل مساعد أعمال السنة حسب السياق", () => {
  it("يحجب المسار خارج المدرسة ويضيف المدخل داخل لوحة المدرسة فقط", () => {
    const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
    const schoolPanel = readFileSync(new URL("../client/src/components/SchoolWorkspacePanel.tsx", import.meta.url), "utf8");
    expect(app).toContain('location === "/year-work") return document.documentElement.dataset.workspace === "school"');
    expect(app).toContain("مساعد أعمال السنة خاص بالمدرسة");
    expect(app).not.toContain('<Link href="/year-work"><a className="year-work-entry panel">');
    expect(schoolPanel).toContain("school-year-work-link");
  });
});
