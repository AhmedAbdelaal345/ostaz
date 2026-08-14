export type GroupStudent = { group: string; name: string };

export function studentsForGroup<T extends GroupStudent>(students: T[], groupName: string) {
  return students.filter(student => student.group === groupName);
}
