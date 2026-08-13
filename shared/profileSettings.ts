export type DisplayMode = "ليلي" | "عادي" | "أوتوماتيك";

export function mergeTeacherProfile<T extends Record<string, unknown>>(current: T | null | undefined, patch: Partial<T> & { displayMode?: DisplayMode }): T & { displayMode: DisplayMode } {
  const next = { ...(current ?? {}), ...patch } as T & { displayMode: DisplayMode };
  next.displayMode = patch.displayMode ?? (current?.displayMode as DisplayMode | undefined) ?? "ليلي";
  return next;
}
