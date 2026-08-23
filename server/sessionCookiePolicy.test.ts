import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

describe("سياسة كوكيز جلسات الهاتف", () => {
  it("تجعل كوكيز النطاق المنشور Secure مع SameSite=None حتى يقبلها المتصفح", () => {
    const options = getSessionCookieOptions({ protocol: "http", hostname: "ostaziclone-a7dfgm8e.manus.space", headers: { host: "ostaziclone-a7dfgm8e.manus.space" } } as any);
    expect(options).toMatchObject({ httpOnly: true, path: "/", secure: true, sameSite: "none" });
  });

  it("يستخدم شكلًا صالحًا لتطوير HTTP محليًا بدل كوكيز SameSite=None غير المقبولة", () => {
    const options = getSessionCookieOptions({ protocol: "http", hostname: "localhost", headers: { host: "localhost:3000" } } as any);
    expect(options).toMatchObject({ httpOnly: true, path: "/", secure: false, sameSite: "lax" });
  });
});
