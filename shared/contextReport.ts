export type ContextId = "school" | "center" | "online";

export const contextPlaces: Record<ContextId, string> = {
  school: "مدرسة",
  center: "سنتر",
  online: "أونلاين",
};

export function calculateContextReport({ groups, students, attendanceRows, contextId }: { groups: any[]; students: any[]; attendanceRows: any[]; contextId: ContextId }) {
  const scopeGroups = groups.filter(group => group.place === contextPlaces[contextId]);
  const names = new Set(scopeGroups.map(group => group.name));
  const scopeStudents = students.filter(student => names.has(student.group));
  const ids = new Set(scopeStudents.map(student => student.id));
  const rows = attendanceRows.filter(row => ids.has(row.studentId));
  const present = rows.filter(row => row.status === "present" || row.status === "late").length;
  const expected = scopeStudents.reduce((sum, student) => sum + Number(scopeGroups.find(group => group.name === student.group)?.fee || 0), 0);
  const collected = scopeStudents.reduce((sum, student) => sum + Number(student.paidAmount || 0), 0);
  return { scopeGroups, scopeStudents, rows, attendanceRate: rows.length ? Math.round((present / rows.length) * 100) : null, expected, collected, remaining: Math.max(0, expected - collected) };
}
