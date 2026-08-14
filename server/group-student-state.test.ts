import { describe, expect, it } from "vitest";
import { addStudentToGroupState } from "../shared/groupStudentState";
import { studentsForGroup } from "../shared/groupStudents";

describe("add student from group card", () => {
  it("links the new student to the selected group and updates its count", () => {
    const result = addStudentToGroupState(
      [{ id: 1, name: "الثالث الثانوي", students: 0 }, { id: 2, name: "الأونلاين", students: 0 }],
      [],
      { id: 10, name: "سارة", group: "الثالث الثانوي" },
    );
    expect(result.groupId).toBe(1);
    expect(result.groups.find(group => group.id === 1)?.students).toBe(1);
    expect(studentsForGroup(result.students, "الثالث الثانوي")).toHaveLength(1);
    expect(studentsForGroup(result.students, "الأونلاين")).toHaveLength(0);
  });
});
