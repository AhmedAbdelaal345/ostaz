import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const teacherProfiles = mysqlTable("teacher_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 120 }).notNull(),
  paymentBank: varchar("paymentBank", { length: 160 }),
  paymentWallet: varchar("paymentWallet", { length: 64 }),
  paymentNote: text("paymentNote"),
  contactPhone: varchar("contactPhone", { length: 32 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactWhatsapp: varchar("contactWhatsapp", { length: 320 }),
  messageTemplate: text("messageTemplate"),
  displayMode: mysqlEnum("displayMode", ["ليلي", "عادي", "أوتوماتيك"]).default("ليلي").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studyGroups = mysqlTable("study_groups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  place: varchar("place", { length: 40 }).notNull(),
  mode: varchar("mode", { length: 40 }).notNull(),
  studentsCount: int("studentsCount").default(0).notNull(),
  day: varchar("day", { length: 30 }).notNull(),
  time: varchar("time", { length: 30 }).notNull(),
  scheduleJson: text("scheduleJson"),
  fee: decimal("fee", { precision: 10, scale: 2 }).default("0").notNull(),
  collectionPeriod: mysqlEnum("collectionPeriod", ["monthly", "term"]).default("monthly").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId"),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  guardianName: varchar("guardianName", { length: 160 }),
  guardianPhone: varchar("guardianPhone", { length: 32 }),
  studentCode: varchar("studentCode", { length: 80 }),
  paid: boolean("paid").default(false).notNull(),
  paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studentAccounts = mysqlTable("student_accounts", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().unique(),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const weeklyQuizzes = mysqlTable("weekly_quizzes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  instructions: text("instructions"),
  questionType: mysqlEnum("questionType", ["mcq", "true_false", "essay"]).notNull(),
  questionsJson: text("questionsJson").notNull(),
  maxScore: decimal("maxScore", { precision: 8, scale: 2 }).notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  answersJson: text("answersJson").notNull(),
  score: decimal("score", { precision: 8, scale: 2 }),
  status: mysqlEnum("status", ["submitted", "graded"]).default("submitted").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  gradedAt: timestamp("gradedAt"),
});

export const centers = mysqlTable("centers", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const centerMembers = mysqlTable("center_members", {
  id: int("id").autoincrement().primaryKey(),
  centerId: int("centerId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "teacher", "assistant"]).default("teacher").notNull(),
  permissionsJson: text("permissionsJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  groupId: int("groupId"),
  lessonDate: timestamp("lessonDate").notNull(),
  status: mysqlEnum("status", ["present", "late", "absent"]).default("present").notNull(),
  note: varchar("note", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId"),
  groupId: int("groupId"),
  kind: mysqlEnum("kind", ["subscription", "expense"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  contentEncoding: varchar("contentEncoding", { length: 32 }).default("aes128gcm").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  groupId: int("groupId"),
  title: varchar("title", { length: 180 }).notNull(),
  period: mysqlEnum("period", ["lesson", "daily", "weekly", "monthly", "term"]).notNull(),
  score: decimal("score", { precision: 6, scale: 2 }),
  maxScore: decimal("maxScore", { precision: 6, scale: 2 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const behaviorRecords = mysqlTable("behavior_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  groupId: int("groupId"),
  category: mysqlEnum("category", ["positive", "warning", "note"]).default("note").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  note: text("note"),
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type InsertTeacherProfile = typeof teacherProfiles.$inferInsert;
export type StudyGroup = typeof studyGroups.$inferSelect;
export type InsertStudyGroup = typeof studyGroups.$inferInsert;
export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;
export type BehaviorRecord = typeof behaviorRecords.$inferSelect;
export type InsertBehaviorRecord = typeof behaviorRecords.$inferInsert;
