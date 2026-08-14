type StudentLike = { id: number; name: string; group: string; [key: string]: unknown };
type GroupLike = { id: number; name: string; students: number; [key: string]: unknown };

export function addStudentToGroupState<T extends GroupLike, S extends StudentLike>(groups: T[], students: S[], student: S) {
  const group = groups.find(item => item.name === student.group);
  return {
    students: [...students, student],
    groups: group ? groups.map(item => item.id === group.id ? { ...item, students: item.students + 1 } : item) : groups,
    groupId: group?.id ?? null,
  };
}
