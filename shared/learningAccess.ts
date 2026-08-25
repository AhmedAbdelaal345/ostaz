export function canStudentAccessGroup(studentGroupId: number | null, requestedGroupId: number) {
  return studentGroupId !== null && studentGroupId === requestedGroupId;
}

export function acceptsAssignmentImageMime(mimeType: string) {
  return ["image/png", "image/jpeg", "image/webp"].includes(mimeType.toLowerCase());
}
