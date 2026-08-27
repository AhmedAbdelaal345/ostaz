import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("مدخل واجهة النشر", () => {
  it("يستخدم مدخل Vite صريحًا كي يحوله البناء إلى حزمة إنتاج", () => {
    const htmlPath = path.resolve(import.meta.dirname, "../client/index.html");
    const html = fs.readFileSync(htmlPath, "utf8");

    expect(html).toContain('<script type="module" src="/src/main.tsx"></script>');
    expect(html).not.toContain("document.createElement('script')");
    expect(html).not.toContain('app.src = \'/src/main.tsx\'');
  });
});
