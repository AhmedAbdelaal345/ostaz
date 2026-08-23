import { describe, expect, it } from "vitest";
import { createTeacherSession, getTeacherSession, TEACHER_SESSION_COOKIE } from "./teacherAuth";

describe("teacher phone authentication helpers", () => {
  it("signs and reads a teacher session with user isolation", async () => {
    const token = await createTeacherSession({ accountId: 31, userId: 72 });
    const session = await getTeacherSession({ headers: { cookie: `${TEACHER_SESSION_COOKIE}=${token}` } } as any);

    expect(session).toEqual({ accountId: 31, userId: 72 });
  });

  it("rejects a student cookie as a teacher session", async () => {
    const session = await getTeacherSession({ headers: { cookie: "ostazi_student_session=not-a-teacher-token" } } as any);

    expect(session).toBeNull();
  });
});
