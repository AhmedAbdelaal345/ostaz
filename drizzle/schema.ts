import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, uniqueIndex, index } from "drizzle-orm/mysql-core";

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
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  paymentBank: varchar("paymentBank", { length: 160 }),
  paymentWallet: varchar("paymentWallet", { length: 64 }),
  paymentNote: text("paymentNote"),
  contactPhone: varchar("contactPhone", { length: 32 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactWhatsapp: varchar("contactWhatsapp", { length: 320 }),
  messageTemplate: text("messageTemplate"),
  schoolScheduleJson: text("schoolScheduleJson"),
  weeklyEvaluationJson: text("weeklyEvaluationJson"),
  displayMode: mysqlEnum("displayMode", ["ليلي", "عادي", "أوتوماتيك"]).default("ليلي").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studyGroups = mysqlTable("study_groups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspace: mysqlEnum("workspace", ["school", "center", "online"]).default("center").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  place: varchar("place", { length: 40 }).notNull(),
  mode: varchar("mode", { length: 40 }).notNull(),
  studentsCount: int("studentsCount").default(0).notNull(),
  day: varchar("day", { length: 30 }).notNull(),
  time: varchar("time", { length: 30 }).notNull(),
  scheduleJson: text("scheduleJson"),
  fee: decimal("fee", { precision: 10, scale: 2 }).default("0").notNull(),
  collectionPeriod: mysqlEnum("collectionPeriod", ["monthly", "term", "per_lesson"]).default("monthly").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userWorkspaceIdx: index("study_groups_user_workspace_idx").on(table.userId, table.workspace),
}));

export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspace: mysqlEnum("workspace", ["school", "center", "online"]).default("center").notNull(),
  groupId: int("groupId"),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  guardianName: varchar("guardianName", { length: 160 }),
  guardianPhone: varchar("guardianPhone", { length: 32 }),
  studentCode: varchar("studentCode", { length: 80 }),
  age: int("age"),
  grade: varchar("grade", { length: 120 }),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  paid: boolean("paid").default(false).notNull(),
  paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  joinedGroupAt: timestamp("joinedGroupAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userWorkspaceIdx: index("students_user_workspace_idx").on(table.userId, table.workspace),
  userWorkspaceGroupIdx: index("students_user_workspace_group_idx").on(table.userId, table.workspace, table.groupId),
}));

export const studentAccounts = mysqlTable("student_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull().unique(),
  phone: varchar("phone", { length: 32 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, table => ({
  userPhoneUnique: uniqueIndex("student_accounts_user_phone_unique").on(table.userId, table.phone),
}));

export const teacherAccounts = mysqlTable("teacher_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const accountSessions = mysqlTable("account_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  accountType: mysqlEnum("accountType", ["teacher", "student"]).notNull(),
  accountId: int("accountId").notNull(),
  deviceName: varchar("deviceName", { length: 220 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
});

export const weeklyQuizzes = mysqlTable("weekly_quizzes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  workspace: mysqlEnum("workspace", ["school", "center", "online"]).default("center").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  instructions: text("instructions"),
  questionType: mysqlEnum("questionType", ["mcq", "true_false", "essay"]).notNull(),
  questionsJson: text("questionsJson").notNull(),
  maxScore: decimal("maxScore", { precision: 8, scale: 2 }).notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userWorkspaceStartsAt: index("weekly_quizzes_user_workspace_starts_at").on(table.userId, table.workspace, table.startsAt),
}));

export const learningMaterials = mysqlTable("learning_materials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  materialType: mysqlEnum("materialType", ["audio", "image", "pdf"]).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  storageUrl: varchar("storageUrl", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 80 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  answersJson: text("answersJson").notNull(),
  score: decimal("score", { precision: 8, scale: 2 }),
  status: mysqlEnum("status", ["in_progress", "submitted", "graded", "locked"]).default("in_progress").notNull(),
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
  workspace: mysqlEnum("workspace", ["school", "center", "online"]).default("center").notNull(),
  studentId: int("studentId").notNull(),
  groupId: int("groupId"),
  lessonDate: timestamp("lessonDate").notNull(),
  status: mysqlEnum("status", ["present", "late", "absent"]).default("present").notNull(),
  note: varchar("note", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userWorkspaceLessonIdx: index("attendance_user_workspace_lesson_idx").on(table.userId, table.workspace, table.lessonDate),
}));

export const financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspace: mysqlEnum("workspace", ["school", "center", "online"]).default("center").notNull(),
  studentId: int("studentId"),
  groupId: int("groupId"),
  kind: mysqlEnum("kind", ["subscription", "expense"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userWorkspaceCreatedIdx: index("financial_user_workspace_created_idx").on(table.userId, table.workspace, table.createdAt),
}));

export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountType: mysqlEnum("accountType", ["teacher", "student"]).default("teacher").notNull(),
  studentId: int("studentId"),
  endpoint: text("endpoint").notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  contentEncoding: varchar("contentEncoding", { length: 32 }).default("aes128gcm").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userStudentIdx: index("push_subscriptions_user_student_idx").on(table.userId, table.studentId),
}));

export const lessonReminders = mysqlTable("lesson_reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enabled: boolean("enabled").default(false).notNull(),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }).unique(),
  lastReminderKey: varchar("last_reminder_key", { length: 180 }),
  lastDeliveredAt: timestamp("last_delivered_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const automationSchedules = mysqlTable("automation_schedules", {
  id: int("id").autoincrement().primaryKey(),
  kind: varchar("kind", { length: 80 }).notNull().unique(),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }).unique(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const personalReminders = mysqlTable("personal_reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  note: text("note"),
  remindAt: timestamp("remindAt").notNull(),
  recurrence: mysqlEnum("recurrence", ["once", "daily", "weekly"]).default("once").notNull(),
  completed: boolean("completed").default(false).notNull(),
  lastDeliveredAt: timestamp("lastDeliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studentPointLedger = mysqlTable("student_point_ledger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  source: mysqlEnum("source", ["attendance", "homework", "high_score", "redemption", "manual"]).notNull(),
  points: int("points").notNull(),
  note: varchar("note", { length: 320 }),
  referenceKey: varchar("referenceKey", { length: 180 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const rewardRedemptions = mysqlTable("reward_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  rewardType: mysqlEnum("rewardType", ["next_subscription_discount", "free_booklet", "gift", "app_subscription_discount"]).notNull(),
  pointsCost: int("pointsCost").notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }),
  note: varchar("note", { length: 320 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const studentSubscriptionCredits = mysqlTable("student_subscription_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  rewardRedemptionId: int("rewardRedemptionId").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["available", "applied"]).default("available").notNull(),
  appliedAt: timestamp("appliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const groupDiscussionMessages = mysqlTable("group_discussion_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  authorType: mysqlEnum("authorType", ["teacher", "assistant", "student"]).notNull(),
  authorStudentId: int("authorStudentId"),
  body: text("body").notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const groupAnnouncements = mysqlTable("group_announcements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  audience: mysqlEnum("audience", ["students", "guardians", "all"]).default("all").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const groupNotes = mysqlTable("group_notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  body: varchar("body", { length: 500 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  refreshedAt: timestamp("refreshedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const videoLessons = mysqlTable("video_lessons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  sourceType: mysqlEnum("sourceType", ["upload", "external", "live"]).notNull(),
  storageKey: varchar("storageKey", { length: 512 }),
  storageUrl: varchar("storageUrl", { length: 512 }),
  externalUrl: varchar("externalUrl", { length: 1024 }),
  accessCodeHash: varchar("accessCodeHash", { length: 255 }),
  watermarkEnabled: boolean("watermarkEnabled").default(true).notNull(),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  instructions: text("instructions"),
  dueAt: timestamp("dueAt"),
  status: mysqlEnum("status", ["draft", "published", "closed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assignmentSubmissions = mysqlTable("assignment_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assignmentId: int("assignmentId").notNull(),
  studentId: int("studentId").notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  storageUrl: varchar("storageUrl", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 80 }).notNull(),
  reviewNote: text("reviewNote"),
  score: decimal("score", { precision: 6, scale: 2 }),
  status: mysqlEnum("status", ["submitted", "reviewed"]).default("submitted").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
}, table => ({ uniqueAssignmentStudent: uniqueIndex("assignment_submissions_assignment_student").on(table.assignmentId, table.studentId) }));

export const quizFocusEvents = mysqlTable("quiz_focus_events", {
  id: int("id").autoincrement().primaryKey(),
  quizAttemptId: int("quizAttemptId").notNull(),
  studentId: int("studentId").notNull(),
  eventType: mysqlEnum("eventType", ["visibility_hidden", "window_blur", "fullscreen_exit"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const studentDeviceBindings = mysqlTable("student_device_bindings", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().unique(),
  deviceIdHash: varchar("deviceIdHash", { length: 128 }).notNull(),
  deviceName: varchar("deviceName", { length: 220 }).notNull(),
  status: mysqlEnum("status", ["active", "release_requested"]).default("active").notNull(),
  releaseRequestedAt: timestamp("releaseRequestedAt"),
  boundAt: timestamp("boundAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
});

export const parentAccounts = mysqlTable("parent_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ uniqueParentPhone: uniqueIndex("parent_accounts_user_phone").on(table.userId, table.phone) }));

export const parentStudentLinks = mysqlTable("parent_student_links", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").notNull(),
  studentId: int("studentId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ uniqueParentStudent: uniqueIndex("parent_student_links_parent_student").on(table.parentId, table.studentId) }));

export const centerRooms = mysqlTable("center_rooms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  capacity: int("capacity").notNull(),
  seatMapJson: text("seatMapJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const seatReservations = mysqlTable("seat_reservations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  roomId: int("roomId").notNull(),
  studentId: int("studentId").notNull(),
  sessionAt: timestamp("sessionAt").notNull(),
  seatNumber: varchar("seatNumber", { length: 24 }).notNull(),
  status: mysqlEnum("status", ["reserved", "cancelled", "attended"]).default("reserved").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ uniqueStudentSession: uniqueIndex("seat_reservations_student_session").on(table.studentId, table.sessionAt), uniqueSeatSession: uniqueIndex("seat_reservations_room_seat_session").on(table.roomId, table.seatNumber, table.sessionAt) }));

export const storeProducts = mysqlTable("store_products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  fulfillment: mysqlEnum("fulfillment", ["pickup", "delivery", "both"]).default("pickup").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const storeOrders = mysqlTable("store_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  fulfillment: mysqlEnum("fulfillment", ["pickup", "delivery"]).notNull(),
  deliveryAddress: text("deliveryAddress"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "ready", "out_for_delivery", "fulfilled", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const storeOrderItems = mysqlTable("store_order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  titleSnapshot: varchar("titleSnapshot", { length: 180 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
});

export const walletLedger = mysqlTable("wallet_ledger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId").notNull(),
  source: mysqlEnum("source", ["kiosk_code", "manual", "store_order", "subscription_payment", "adjustment"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  note: varchar("note", { length: 320 }),
  referenceKey: varchar("referenceKey", { length: 180 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const walletTopupCodes = mysqlTable("wallet_topup_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  codeHash: varchar("codeHash", { length: 128 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["unused", "redeemed", "void"]).default("unused").notNull(),
  redeemedByStudentId: int("redeemedByStudentId"),
  redeemedAt: timestamp("redeemedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspace: mysqlEnum("workspace", ["school", "center", "online"]).default("center").notNull(),
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
  workspace: mysqlEnum("workspace", ["school", "center", "online"]).default("center").notNull(),
  studentId: int("studentId").notNull(),
  groupId: int("groupId"),
  category: mysqlEnum("category", ["positive", "warning", "note"]).default("note").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  note: text("note"),
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yearWorkTerms = mysqlTable("year_work_terms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  term: mysqlEnum("term", ["first", "second"]).notNull(),
  grade: varchar("grade", { length: 120 }).notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  monthsJson: text("monthsJson").notNull(),
  studentIdsJson: text("studentIdsJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const yearWorkScores = mysqlTable("year_work_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  termId: int("termId").notNull(),
  studentId: int("studentId").notNull(),
  monthKey: varchar("monthKey", { length: 7 }).notNull(),
  homeWork: int("homeWork").default(0).notNull(),
  activity: int("activity").default(0).notNull(),
  weeklyEvaluation: int("weeklyEvaluation").default(0).notNull(),
  performanceTasks: int("performanceTasks").default(0).notNull(),
  behavior: int("behavior").default(0).notNull(),
  attendance: int("attendance").default(0).notNull(),
  monthlyExam: int("monthlyExam").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ uniqueStudentMonth: uniqueIndex("year_work_scores_term_student_month").on(table.termId, table.studentId, table.monthKey) }));

export const changeLogs = mysqlTable("change_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: mysqlEnum("category", ["student", "group", "attendance", "finance", "assessment", "settings"]).notNull(),
  action: mysqlEnum("action", ["created", "updated", "deleted", "recorded", "settled"]).notNull(),
  entityName: varchar("entityName", { length: 180 }).notNull(),
  details: varchar("details", { length: 255 }),
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
export type ChangeLog = typeof changeLogs.$inferSelect;
export type InsertChangeLog = typeof changeLogs.$inferInsert;
export type YearWorkTerm = typeof yearWorkTerms.$inferSelect;
export type InsertYearWorkTerm = typeof yearWorkTerms.$inferInsert;
export type YearWorkScore = typeof yearWorkScores.$inferSelect;
export type InsertYearWorkScore = typeof yearWorkScores.$inferInsert;
export type AccountSession = typeof accountSessions.$inferSelect;
export type InsertAccountSession = typeof accountSessions.$inferInsert;
