import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("استعادة الجلسة بعد فتح التطبيق", () => {
  it("يفرض طلبًا حديثًا لجلسة المعلم والطالب قبل إعادة التوجيه إلى بوابة الدخول", () => {
    const main = readFileSync(new URL("../client/src/main.tsx", import.meta.url), "utf8");
    const studentPortal = readFileSync(new URL("../client/src/pages/StudentPortal.tsx", import.meta.url), "utf8");
    expect(main).toContain('staleTime: 0, refetchOnMount: "always"');
    expect(main).toContain("session.isFetchedAfterMount && !session.isFetching && !session.isError && !session.data");
    expect(studentPortal).toContain('staleTime: 0, refetchOnMount: "always"');
    expect(studentPortal).toContain("student.isFetchedAfterMount && !student.isFetching && !student.data");
  });
});
