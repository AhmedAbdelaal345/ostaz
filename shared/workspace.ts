export const workspaceIds = ["school", "center", "online"] as const;
export type Workspace = (typeof workspaceIds)[number];

export const workspacePlaces: Record<Workspace, string> = {
  school: "مدرسة",
  center: "سنتر",
  online: "أونلاين",
};

export function workspaceFromPlace(place: string): Workspace {
  const normalized = place.trim();
  if (normalized.includes("مدرس")) return "school";
  if (normalized.includes("أونلاين") || normalized.toLowerCase().includes("online")) return "online";
  return "center";
}

export function isWorkspace(value: string): value is Workspace {
  return (workspaceIds as readonly string[]).includes(value);
}
