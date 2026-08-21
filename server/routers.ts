import { z } from "zod";
import PDFDocument from "pdfkit";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createGroup, createStudent, createTransaction, deleteGroup, deleteStudent, getTeacherProfile, listAttendance, listGroups, listStudents, listTransactions, markAttendance, saveTeacherProfile, settleTransaction, updateGroup, updateStudent } from "./db";

const groupInput = z.object({ name: z.string().min(1), place: z.string().min(1), mode: z.string().min(1), studentsCount: z.number().int().min(0).default(0), day: z.string().min(1), time: z.string().min(1), scheduleJson: z.string().optional().nullable(), fee: z.union([z.string(), z.number()]).transform(String) });
const studentInput = z.object({ name: z.string().min(1), groupId: z.number().int().nullable().optional(), phone: z.string().optional().nullable(), guardianName: z.string().optional().nullable(), guardianPhone: z.string().optional().nullable(), studentCode: z.string().optional().nullable(), paid: z.boolean().default(false) });
const attendanceInput = z.object({ studentId: z.number().int(), groupId: z.number().int().nullable().optional(), lessonDate: z.coerce.date(), status: z.enum(["present", "late", "absent"]).default("present"), note: z.string().optional().nullable() });
const transactionInput = z.object({ studentId: z.number().int().nullable().optional(), groupId: z.number().int().nullable().optional(), kind: z.enum(["subscription", "expense"]), amount: z.union([z.string(), z.number()]).transform(String), dueDate: z.coerce.date().nullable().optional(), paidAt: z.coerce.date().nullable().optional(), description: z.string().optional().nullable() });
const profileInput = z.object({ name: z.string().min(1), phone: z.string().optional().nullable(), subject: z.string().min(1), paymentBank: z.string().optional().nullable(), paymentWallet: z.string().optional().nullable(), paymentNote: z.string().optional().nullable(), contactPhone: z.string().optional().nullable(), contactEmail: z.string().email().optional().or(z.literal("")), contactWhatsapp: z.string().optional().nullable(), messageTemplate: z.string().optional().nullable(), displayMode: z.enum(["ليلي", "عادي", "أوتوماتيك"]).default("ليلي") });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  report: router({ pdf: protectedProcedure.query(async ({ ctx }) => { const [groups, studentRows] = await Promise.all([listGroups(ctx.user.id), listStudents(ctx.user.id)]); return await new Promise<{ filename: string; contentBase64: string }>((resolve) => { const doc = new PDFDocument({ size: "A4", margin: 40 }); const chunks: Buffer[] = []; doc.on("data", (chunk: Buffer) => chunks.push(chunk)); doc.on("end", () => resolve({ filename: "ostazi-statistics.pdf", contentBase64: Buffer.concat(chunks).toString("base64") })); doc.fontSize(20).text("Ostazi - Teacher Statistics"); doc.moveDown(); doc.fontSize(12).text(`Students: ${studentRows.length}`); doc.text(`Groups: ${groups.length}`); doc.text(`Paid students: ${studentRows.filter(s => s.paid).length}`); doc.text(`Outstanding students: ${studentRows.filter(s => !s.paid).length}`); doc.moveDown(); doc.fontSize(14).text("Groups"); groups.forEach((g, index) => doc.fontSize(10).text(`${index + 1}. ${g.name} | ${g.place} | ${g.day} ${g.time}`)); doc.end(); }); }) }),
  app: router({
    bootstrap: protectedProcedure.query(async ({ ctx }) => ({ profile: await getTeacherProfile(ctx.user.id), groups: await listGroups(ctx.user.id), students: await listStudents(ctx.user.id) })),
    profile: router({ get: protectedProcedure.query(({ ctx }) => getTeacherProfile(ctx.user.id)), save: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => saveTeacherProfile(ctx.user.id, input)) }),
    groups: router({ list: protectedProcedure.query(({ ctx }) => listGroups(ctx.user.id)), create: protectedProcedure.input(groupInput).mutation(({ ctx, input }) => createGroup(ctx.user.id, input)), update: protectedProcedure.input(z.object({ id: z.number().int(), data: groupInput.partial() })).mutation(({ ctx, input }) => updateGroup(ctx.user.id, input.id, input.data)), delete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteGroup(ctx.user.id, input.id)) }),
    students: router({ list: protectedProcedure.query(({ ctx }) => listStudents(ctx.user.id)), create: protectedProcedure.input(studentInput).mutation(({ ctx, input }) => createStudent(ctx.user.id, input)), update: protectedProcedure.input(z.object({ id: z.number().int(), data: studentInput.partial() })).mutation(({ ctx, input }) => updateStudent(ctx.user.id, input.id, input.data)), delete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteStudent(ctx.user.id, input.id)) }),
    attendance: router({ list: protectedProcedure.input(z.object({ lessonDate: z.coerce.date() })).query(({ ctx, input }) => listAttendance(ctx.user.id, input.lessonDate)), mark: protectedProcedure.input(attendanceInput).mutation(({ ctx, input }) => markAttendance(ctx.user.id, input)) }),
    finance: router({ list: protectedProcedure.query(({ ctx }) => listTransactions(ctx.user.id)), create: protectedProcedure.input(transactionInput).mutation(({ ctx, input }) => createTransaction(ctx.user.id, input)), settle: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => settleTransaction(ctx.user.id, input.id)) }),
  }),
});
export type AppRouter = typeof appRouter;
