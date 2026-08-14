type GroupLike = { id: number; name: string; students: number; [key: string]: unknown };
type StudentLike = { group: string; [key: string]: unknown };

export function renameGroupWithStudentCount<T extends GroupLike>(groups: T[], students: StudentLike[], groupId: number, nextName: string) {
  const current = groups.find(group => group.id === groupId);
  const count = current ? students.filter(student => student.group === current.name).length : 0;
  return groups.map(group => group.id === groupId ? { ...group, name: nextName, students: count } : group);
}
