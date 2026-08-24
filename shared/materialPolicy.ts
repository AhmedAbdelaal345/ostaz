export type MaterialKind = "audio" | "image" | "pdf";

export const allowedMaterialMimes: Record<MaterialKind, readonly string[]> = {
  audio: ["audio/mpeg", "audio/aac", "audio/mp4"],
  image: ["image/webp"],
  pdf: ["application/pdf"],
};

export function acceptsMaterialMime(kind: MaterialKind, mime: string) {
  return allowedMaterialMimes[kind].includes(mime.toLowerCase());
}
