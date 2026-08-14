import { describe, expect, it } from "vitest";
import { isExistingStudentDraft } from "../shared/studentDraft";

describe("student draft flow", () => {
  it("keeps a group plus draft in create mode and existing records in edit mode", () => {
    expect(isExistingStudentDraft({ __newStudent: true, group: "الثالث الثانوي" })).toBe(false);
    expect(isExistingStudentDraft({ id: 42, group: "الثالث الثانوي" })).toBe(true);
  });
});
