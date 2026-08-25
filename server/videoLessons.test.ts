import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const studentView = readFileSync(new URL("../client/src/components/StudentVideoHub.tsx", import.meta.url), "utf8");

describe("دروس الفيديو والجلسات", () => {
  it("يعرض للطالب المحتوى المنشور في مجموعته فقط", () => {
    expect(dbSource).toContain("listStudentVideoLessons(studentId: number)");
    expect(dbSource).toContain("eq(videoLessons.userId, access.userId)");
    expect(dbSource).toContain("eq(videoLessons.groupId, access.groupId)");
    expect(dbSource).toContain("eq(videoLessons.status, \"published\")");
  });

  it("يربط إنشاء محتوى المعلم بملكية المجموعة ويتطلب جلسة طالب عند القراءة", () => {
    expect(dbSource).toContain("eq(studyGroups.id, input.groupId), eq(studyGroups.userId, userId)");
    expect(routerSource).toContain("video: router");
    expect(routerSource).toContain("return listStudentVideoLessons(session.studentId)");
  });

  it("يعرض العلامة المائية كحاجز مرئي فقط دون ادعاء منع التسجيل", () => {
    expect(studentView).toContain("video-watermark");
    expect(studentView).toContain("not a technical block on recording");
    expect(studentView).toContain("cannot block screenshots");
  });
});
