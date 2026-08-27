import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const teacherStore = readFileSync(new URL("../client/src/components/TeacherStorePanel.tsx", import.meta.url), "utf8");
const studentStore = readFileSync(new URL("../client/src/components/StudentStoreHub.tsx", import.meta.url), "utf8");

describe("المتجر والمحفظة", () => {
  it("يحفظ كود الشحن كهاش ولا يعيد عرضه من قاعدة البيانات", () => {
    expect(schema).toContain("codeHash");
    expect(dbSource).toContain('createHash("sha256").update(code).digest("hex")');
    expect(dbSource).toContain('createHash("sha256").update(rawCode.trim().toUpperCase()).digest("hex")');
    expect(teacherStore).toContain("يظهر هذه المرة فقط");
  });

  it("يقيد الكتالوج والرصيد والطلب بسياق الطالب الحقيقي", () => {
    expect(dbSource).toContain("getStudentCommerceContext(studentId)");
    expect(dbSource).toContain("eq(storeProducts.userId, context.userId)");
    expect(dbSource).toContain("eq(walletLedger.studentId, studentId)");
    expect(routerSource).toContain("studentProducts: publicProcedure");
    expect(routerSource).toContain("createStudentOrder: publicProcedure");
  });

  it("يتحقق من المخزون والرصيد ويردّهما عند إلغاء قابل للإلغاء", () => {
    expect(dbSource).toContain("PRODUCT_UNAVAILABLE");
    expect(dbSource).toContain("WALLET_BALANCE_LOW");
    expect(dbSource).toContain("stockQuantity} + ${item.quantity}");
    expect(dbSource).toContain("refund:${orderId}");
    expect(studentStore).toContain("لا توجد بوابة دفع إلكتروني مفعلة حاليًا");
  });

  it("يسدد اشتراك الطالب من رصيده فقط ويسجل الأثر في المحفظة والمالية", () => {
    expect(routerSource).toContain("paySubscriptionWithWallet: publicProcedure");
    expect(routerSource).toContain("payStudentSubscriptionWithWallet(session.studentId)");
    expect(dbSource).toContain('source: "subscription_payment"');
    expect(dbSource).toContain("سداد اشتراك");
    expect(dbSource).toContain("paidAmount: String(fee), paid: true");
    expect(dbSource).toContain('kind: "subscription"');
    expect(studentStore).toContain("سداد اشتراك مجموعتي من الرصيد");
  });
});
