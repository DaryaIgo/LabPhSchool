import {
  mysqlTable,
  mysqlEnum,
  serial,
  text,
  timestamp,
  int,
  bigint,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Student Learning Lifecycle (enrollments, progress, lab progress)
// ═══════════════════════════════════════════════════════════════

// Soft references to other domains:
// - localUserId  -> auth.local_users.id
// - topicId      -> content.topics.id
// - currentSubtopicId / subtopicId -> content.subtopics.id
// - labWorkId    -> labs.lab_works.id

export const enrollments = mysqlTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
      .notNull(),
    topicId: bigint("topic_id", { mode: "number", unsigned: true })
      .notNull(),
    status: mysqlEnum("status", ["active", "completed", "suspended"])
      .default("active")
      .notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    comment: text("comment"),
    currentSubtopicId: bigint("current_subtopic_id", {
      mode: "number",
      unsigned: true,
    }),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    // Soft reference to users.id (auth domain).
    createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  },
  (table) => ({
    uniqueEnrollment: uniqueIndex("unique_enrollment").on(
      table.localUserId,
      table.topicId
    ),
    localUserIdx: index("enrollment_local_user_idx").on(table.localUserId),
    topicIdx: index("enrollment_topic_idx").on(table.topicId),
  })
);

export type Enrollment = typeof enrollments.$inferSelect;

export const studentProgress = mysqlTable("student_progress", {
  id: serial("id").primaryKey(),
  localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
    .notNull(),
  subtopicId: bigint("subtopic_id", { mode: "number", unsigned: true })
    .notNull(),
  theoryCompleted: mysqlEnum("theory_completed", ["pending", "completed"])
    .default("pending")
    .notNull(),
  practiceCompleted: mysqlEnum("practice_completed", ["pending", "completed"])
    .default("pending")
    .notNull(),
  labCompleted: mysqlEnum("lab_completed", ["pending", "completed"])
    .default("pending")
    .notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"])
    .default("not_started")
    .notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  comment: text("comment"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type StudentProgress = typeof studentProgress.$inferSelect;

export const labProgress = mysqlTable("lab_progress", {
  id: serial("id").primaryKey(),
  localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
    .notNull(),
  labWorkId: bigint("lab_work_id", { mode: "number", unsigned: true })
    .notNull(),
  mode: mysqlEnum("mode", ["training", "self"]).default("self").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "submitted"])
    .default("not_started")
    .notNull(),
  data: json("data"),
  measurements: json("measurements"),
  conclusion: text("conclusion"),
  grade: int("grade"),
  teacherComment: text("teacher_comment"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type LabProgress = typeof labProgress.$inferSelect;
