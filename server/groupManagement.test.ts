import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("إدارة المجموعة والطالب", () => {
  it("يدعم صف المجموعة والتثبيت ومدة الحصة في المخطط والعقد الخادمي", () => {
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(schema).toContain('grade: varchar("grade", { length: 120 })');
    expect(schema).toContain('isPinned: boolean("isPinned")');
    expect(schema).toContain('durationMinutes: int("durationMinutes")');
    expect(router).toContain("durationMinutes: z.number().int().min(1).max(360)");
  });

  it("يربط صف الطالب بالمجموعة ويؤكد الحذف قبل إرساله", () => {
    const database = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(database).toContain("groupRows[0]?.grade?.trim() || input.grade || groupRows[0]?.name || null");
    expect(database).toContain("set({ groupId: null })");
    expect(app).toContain("هل تريد حذف مجموعة");
    expect(app).toContain("هل تريد حذف الطالب");
    expect(app).toContain("aria-label=\"الدقيقة\"");
  });

  it("waits for the saved group schedule mutation before showing success", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(app).toContain("return updateGroupRemote.mutateAsync({");
    expect(app).toContain("await onSubmit(value);");
    expect(app).toContain("catch (error) {");
  });
});
