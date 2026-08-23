import { describe, expect, it } from "vitest";
import { changeLogActionLabels, changeLogCategoryLabels } from "../shared/changeLogPresentation";

describe("تسمية سجل التعديلات", () => {
  it("يعرض تصنيفات وعمليات عربية مفهومة", () => {
    expect(changeLogCategoryLabels.finance).toBe("المالية");
    expect(changeLogActionLabels.deleted).toBe("حذف");
  });
});
