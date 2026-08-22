import { describe, expect, it } from "vitest";
import { createStudentSession, getStudentSession, hashStudentPassword, verifyStudentPassword } from "./studentAuth";

describe("student authentication helpers", () => {
  it("stores only a derived password value and verifies the correct password", async () => {
    const hash = await hashStudentPassword("SafePassword2026");

    expect(hash).not.toContain("SafePassword2026");
    await expect(verifyStudentPassword("SafePassword2026", hash)).resolves.toBe(true);
    await expect(verifyStudentPassword("WrongPassword2026", hash)).resolves.toBe(false);
  });

  it("signs and reads a student session without using the teacher OAuth cookie", async () => {
    const token = await createStudentSession({ accountId: 21, studentId: 87 });
    const session = await getStudentSession({ headers: { cookie: `ostazi_student_session=${token}` } } as any);

    expect(session).toEqual({ accountId: 21, studentId: 87 });
  });
});
