import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const studentView = readFileSync(new URL("../client/src/components/StudentSeatReservation.tsx", import.meta.url), "utf8");

describe("حجز المقاعد", () => {
  it("يفرض فهارس قاعدة البيانات منع المقعد أو الطالب المكرر للموعد نفسه", () => {
    expect(schema).toContain("seat_reservations_student_session");
    expect(schema).toContain("seat_reservations_room_seat_session");
    expect(dbSource).toContain("STUDENT_ALREADY_RESERVED");
    expect(dbSource).toContain("SEAT_ALREADY_RESERVED");
  });

  it("يستخرج المجموعة ومعلمها من جلسة الطالب ولا يقبل المجموعة من العميل", () => {
    expect(dbSource).toContain("const access = await getStudentGroupAccess(studentId)");
    expect(dbSource).toContain("userId: access.userId, groupId: access.groupId");
    expect(routerSource).toContain("studentAvailability: publicProcedure");
    expect(routerSource).toContain("reserve: publicProcedure");
  });

  it("يعرض المقعد المحجوز كغير متاح ويتيح إلغاء الحجز الذاتي فقط", () => {
    expect(studentView).toContain("reservedSeats.includes(seat)");
    expect(studentView).toContain("cancelMine");
    expect(dbSource).toContain("eq(seatReservations.studentId, studentId)");
  });
});
