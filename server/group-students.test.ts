import { describe, expect, it } from "vitest";
import { studentsForGroup } from "../shared/groupStudents";

describe("group student details", () => {
  it("returns only students belonging to the selected group", () => {
    const result = studentsForGroup([
      { name: "سارة", group: "الثالث الثانوي" },
      { name: "عمر", group: "الأونلاين" },
      { name: "نور", group: "الثالث الثانوي" },
    ], "الثالث الثانوي");
    expect(result.map(student => student.name)).toEqual(["سارة", "نور"]);
  });
});
