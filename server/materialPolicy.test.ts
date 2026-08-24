import { describe, expect, it } from "vitest";
import { acceptsMaterialMime } from "../shared/materialPolicy";

describe("سياسة ملفات المواد التعليمية", () => {
  it("تقبل أنواع الملفات المطلوبة فقط", () => {
    expect(acceptsMaterialMime("audio", "audio/mpeg")).toBe(true);
    expect(acceptsMaterialMime("audio", "audio/aac")).toBe(true);
    expect(acceptsMaterialMime("image", "image/webp")).toBe(true);
    expect(acceptsMaterialMime("pdf", "application/pdf")).toBe(true);
    expect(acceptsMaterialMime("image", "image/png")).toBe(false);
    expect(acceptsMaterialMime("pdf", "audio/mpeg")).toBe(false);
  });
});
