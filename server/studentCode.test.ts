import { describe, expect, it } from "vitest";
import { displayStudentCode, generateStudentCode, normalizeStudentCode } from "../shared/studentCode";

describe("كود الطالب المكون من أربع خانات", () => {
  it("يولد ويطبع كودًا رقميًا من أربع خانات", () => {
    expect(generateStudentCode()).toMatch(/^\d{4}$/);
    expect(normalizeStudentCode("١٢٣٤٥٦")).toBe("1234");
    expect(displayStudentCode("ST-12", 9)).toBe("0009");
  });
});
