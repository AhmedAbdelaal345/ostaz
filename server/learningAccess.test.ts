import { describe, expect, it } from "vitest";
import { acceptsAssignmentImageMime, canStudentAccessGroup } from "../shared/learningAccess";

describe("learning access isolation", () => {
  it("allows a student only in their linked group", () => {
    expect(canStudentAccessGroup(12, 12)).toBe(true);
    expect(canStudentAccessGroup(12, 13)).toBe(false);
    expect(canStudentAccessGroup(null, 12)).toBe(false);
  });

  it("accepts only supported assignment image formats", () => {
    expect(acceptsAssignmentImageMime("image/jpeg")).toBe(true);
    expect(acceptsAssignmentImageMime("image/webp")).toBe(true);
    expect(acceptsAssignmentImageMime("application/pdf")).toBe(false);
  });
});
