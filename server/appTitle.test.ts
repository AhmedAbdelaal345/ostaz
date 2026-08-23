import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("عنوان تطبيق El Mister", () => {
  it("يوحد عنوان المتصفح وبيانات PWA", () => {
    const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");
    const manifest = readFileSync(resolve(process.cwd(), "client/public/manifest.json"), "utf8");
    expect(html).toContain("<title>El Mister | المستر</title>");
    expect(manifest).toContain('"name": "El Mister | المستر"');
  });
});
