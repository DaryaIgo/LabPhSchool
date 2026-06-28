import {
  mysqlTable,
  mysqlEnum,
  serial,
  text,
  timestamp,
  int,
  bigint,
  json,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Student Learning Lifecycle (enrollments, progress, lab progress)
// ═══════════════════════════════════════════════════════════════

// Soft references to other domains:
// - localUserId  -> auth.local_users.id
// - topicNodeId  -> content.topic_nodes.id (root nodes = course topics)
// - currentSubtopicNodeId / subtopicNodeId -> content.topic_nodes.id (child nodes)
// - labWorkId    -> labs.lab_works.id

export const enrollments = mysqlTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    localUserId: bigint("local_user_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    topicNodeId: bigint("topic_node_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    status: mysqlEnum("status", ["active", "completed", "suspended"])
      .default("active")
      .notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    comment: text("comment"),
    currentSubtopicNodeId: bigint("current_subtopic_node_id", {
      mode: "number",
      unsigned: true,
    }),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    // Soft reference to users.id (auth domain).
    createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  },
  table => ({
    uniqueEnrollment: uniqueIndex("unique_enrollment").on(
      table.localUserId,
      table.topicNodeId
    ),
    localUserIdx: index("enrollment_local_user_idx").on(table.localUserId),
    topicNodeIdx: index("enrollment_topic_node_idx").on(table.topicNodeId),
  })
);

export type Enrollment = typeof enrollments.$inferSelect;

export const studentProgress = mysqlTable("student_progress", {
  id: serial("id").primaryKey(),
  localUserId: bigint("local_user_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  subtopicNodeId: bigint("subtopic_node_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
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
  localUserId: bigint("local_user_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  labWorkId: bigint("lab_work_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  mode: mysqlEnum("mode", ["training", "self"]).default("self").notNull(),
  status: mysqlEnum("status", [
    "not_started",
    "in_progress",
    "completed",
    "submitted",
  ])
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

// ═══════════════════════════════════════════════════════════════
// Teacher-assigned lab works per enrollment
// ═══════════════════════════════════════════════════════════════

// Soft references:
// - enrollmentId -> learning.enrollments.id
// - localUserId  -> auth.local_users.id
// - labWorkId    -> labs.lab_works.id
// - assignedBy   -> auth.users.id

export const assignedLabWorks = mysqlTable(
  "assigned_lab_works",
  {
    id: serial("id").primaryKey(),
    enrollmentId: bigint("enrollment_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    localUserId: bigint("local_user_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    labWorkId: bigint("lab_work_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    order: int("order").notNull().default(1),
    status: mysqlEnum("status", ["assigned", "submitted", "completed"])
      .default("assigned")
      .notNull(),
    grade: int("grade"),
    teacherComment: text("teacher_comment"),
    assignedBy: bigint("assigned_by", { mode: "number", unsigned: true }),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => ({
    uniqueAssignment: uniqueIndex("unique_assignment").on(
      table.enrollmentId,
      table.labWorkId
    ),
    enrollmentIdx: index("assigned_lab_work_enrollment_idx").on(
      table.enrollmentId
    ),
    localUserIdx: index("assigned_lab_work_local_user_idx").on(
      table.localUserId
    ),
  })
);

export type AssignedLabWork = typeof assignedLabWorks.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Teacher-assigned problems per enrollment
// ═══════════════════════════════════════════════════════════════

// Soft references:
// - enrollmentId -> learning.enrollments.id
// - localUserId  -> auth.local_users.id
// - problemId    -> problems.problems.id
// - assignedBy   -> auth.local_users.id

export const assignedProblems = mysqlTable(
  "assigned_problems",
  {
    id: serial("id").primaryKey(),
    enrollmentId: bigint("enrollment_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    localUserId: bigint("local_user_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    problemId: bigint("problem_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    order: int("order").notNull().default(1),
    status: mysqlEnum("status", ["assigned", "submitted", "completed"])
      .default("assigned")
      .notNull(),
    grade: int("grade"),
    studentAnswer: text("student_answer"),
    solutionImageUrl: varchar("solution_image_url", { length: 500 }),
    submittedAt: timestamp("submitted_at"),
    teacherComment: text("teacher_comment"),
    assignedBy: bigint("assigned_by", { mode: "number", unsigned: true }),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => ({
    uniqueAssignment: uniqueIndex("unique_problem_assignment").on(
      table.enrollmentId,
      table.problemId
    ),
    enrollmentIdx: index("assigned_problem_enrollment_idx").on(
      table.enrollmentId
    ),
    localUserIdx: index("assigned_problem_local_user_idx").on(
      table.localUserId
    ),
  })
);

export type AssignedProblem = typeof assignedProblems.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Teacher-assigned Jupyter notebooks per enrollment
// ═══════════════════════════════════════════════════════════════

// Soft references:
// - enrollmentId -> learning.enrollments.id
// - localUserId  -> auth.local_users.id
// - notebookId   -> jupyter.jupyter_notebooks.id
// - assignedBy   -> auth.users.id

export const assignedJupyterNotebooks = mysqlTable(
  "assigned_jupyter_notebooks",
  {
    id: serial("id").primaryKey(),
    enrollmentId: bigint("enrollment_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    localUserId: bigint("local_user_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    notebookId: bigint("notebook_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    order: int("order").notNull().default(1),
    status: mysqlEnum("status", ["assigned", "submitted", "completed"])
      .default("assigned")
      .notNull(),
    grade: int("grade"),
    studentColabUrl: varchar("student_colab_url", { length: 500 }),
    teacherComment: text("teacher_comment"),
    assignedBy: bigint("assigned_by", { mode: "number", unsigned: true }),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => ({
    uniqueAssignment: uniqueIndex("unique_jupyter_notebook_assignment").on(
      table.enrollmentId,
      table.notebookId
    ),
    enrollmentIdx: index("assigned_jupyter_notebook_enrollment_idx").on(
      table.enrollmentId
    ),
    localUserIdx: index("assigned_jupyter_notebook_local_user_idx").on(
      table.localUserId
    ),
  })
);

export type AssignedJupyterNotebook =
  typeof assignedJupyterNotebooks.$inferSelect;
