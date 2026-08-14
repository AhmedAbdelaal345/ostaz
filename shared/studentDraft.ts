export function isExistingStudentDraft(draft: unknown): draft is { id: number } {
  return Boolean(draft && typeof draft === "object" && "id" in draft && typeof (draft as { id?: unknown }).id === "number" && !(draft as { __newStudent?: boolean }).__newStudent);
}
