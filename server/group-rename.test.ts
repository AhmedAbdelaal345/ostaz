import { describe, expect, it } from "vitest";
import { renameGroupWithStudentCount } from "../shared/groupRename";

describe("group rename count", () => {
  it("preserves the number of linked students when the group name changes", () => {
    const result = renameGroupWithStudentCount(
      [{ id: 1, name: "أولى", students: 2 }],
      [{ group: "أولى" }, { group: "أولى" }, { group: "ثانية" }],
      1,
      "أولى متقدم",
    );
    expect(result[0]).toMatchObject({ name: "أولى متقدم", students: 2 });
  });
});
