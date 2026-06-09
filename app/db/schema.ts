import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  json,
  boolean,
  index,
  uniqueIndex,
  type AnyMySqlColumn,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// RBAC Core Tables
// ═══════════════════════════════════════════════════════════════

// ── ROLES ──
export const roles = mysqlTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;

// ── PERMISSIONS ──
export const permissions = mysqlTable(
  "permissions",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    resource: varchar("resource", { length: 50 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    resourceActionIdx: index("resource_action_idx").on(
      table.resource,
      table.action
    ),
  })
);

export type Permission = typeof permissions.$inferSelect;

// ── ROLE PERMISSIONS (junction) ──
export const rolePermissions = mysqlTable(
  "role_permissions",
  {
    id: serial("id").primaryKey(),
    roleId: bigint("role_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => roles.id),
    permissionId: bigint("permission_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => permissions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueRolePermission: uniqueIndex("unique_role_permission").on(
      table.roleId,
      table.permissionId
    ),
  })
);

export type RolePermission = typeof rolePermissions.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// User Tables
// ═══════════════════════════════════════════════════════════════

// ── USERS (OAuth — Teachers/Admins) ──
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  roleId: bigint("role_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => roles.id)
    .default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── LOCAL USERS (Password-based — Students) ──
export const localUsers = mysqlTable(
  "local_users",
  {
    id: serial("id").primaryKey(),
    login: varchar("login", { length: 100 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    roleId: bigint("role_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => roles.id)
      .default(2),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }),
    status: mysqlEnum("status", ["active", "inactive", "suspended"])
      .default("active")
      .notNull(),
    avatar: varchar("avatar", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    lastLoginAt: timestamp("last_login_at"),
  },
  (table) => ({
    statusIdx: index("local_user_status_idx").on(table.status),
    createdByIdx: index("local_user_created_by_idx").on(table.createdBy),
  })
);

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Course Content Tables
// ═══════════════════════════════════════════════════════════════

// ── TOPICS ──
export const topics = mysqlTable("topics", {
  id: serial("id").primaryKey(),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  formula: varchar("formula", { length: 500 }),
  description: text("description"),
  shortDesc: varchar("short_desc", { length: 500 }),
  color: varchar("color", { length: 20 }).default("#2eff8c"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;

// ── SUBTOPICS ──
export const subtopics = mysqlTable("subtopics", {
  id: serial("id").primaryKey(),
  topicId: bigint("topic_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => topics.id),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"),
  jupyterUrl: varchar("jupyter_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Subtopic = typeof subtopics.$inferSelect;

// ── TOPIC NODES (hierarchical markdown topics) ──
export const topicNodes = mysqlTable("topic_nodes", {
  id: serial("id").primaryKey(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }).references(
    (): AnyMySqlColumn => topicNodes.id
  ),
  order: int("order").notNull().default(1),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  color: varchar("color", { length: 20 }),
  labCategorySlug: varchar("lab_category_slug", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type TopicNode = typeof topicNodes.$inferSelect;
export type InsertTopicNode = typeof topicNodes.$inferInsert;

// ── LABS ──
export const labs = mysqlTable("labs", {
  id: serial("id").primaryKey(),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDesc: varchar("short_desc", { length: 500 }),
  theory: text("theory"),
  iconType: varchar("icon_type", { length: 50 }),
  topicId: bigint("topic_id", { mode: "number", unsigned: true }).references(
    () => topics.id
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Lab = typeof labs.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Progress & Results Tables
// ═══════════════════════════════════════════════════════════════

// ── PROGRESS (OAuth users) ──
export const progress = mysqlTable("progress", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  subtopicId: bigint("subtopic_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => subtopics.id),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"])
    .default("not_started")
    .notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Progress = typeof progress.$inferSelect;

// ── LAB RESULTS ──
export const labResults = mysqlTable("lab_results", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  labId: bigint("lab_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => labs.id),
  result: text("result"),
  grade: int("grade"),
  status: mysqlEnum("status", ["pending", "completed"])
    .default("pending")
    .notNull(),
  data: json("data"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LabResult = typeof labResults.$inferSelect;

// ── STUDENT PROGRESS (local users) ──
export const studentProgress = mysqlTable("student_progress", {
  id: serial("id").primaryKey(),
  localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => localUsers.id, { onDelete: "cascade" }),
  subtopicId: bigint("subtopic_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => subtopics.id),
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

// ═══════════════════════════════════════════════════════════════
// Enrollment Table
// ═══════════════════════════════════════════════════════════════

export const enrollments = mysqlTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => localUsers.id, { onDelete: "cascade" }),
    topicId: bigint("topic_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => topics.id),
    status: mysqlEnum("status", ["active", "completed", "suspended"])
      .default("active")
      .notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    comment: text("comment"),
    currentSubtopicId: bigint("current_subtopic_id", { mode: "number", unsigned: true })
      .references(() => subtopics.id),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
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

// ═══════════════════════════════════════════════════════════════
// Audit Log Table
// ═══════════════════════════════════════════════════════════════

export const auditLog = mysqlTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    actorId: bigint("actor_id", { mode: "number", unsigned: true }).notNull(),
    actorType: mysqlEnum("actor_type", ["user", "local_user"]).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    resource: varchar("resource", { length: 50 }).notNull(),
    resourceId: bigint("resource_id", { mode: "number", unsigned: true }),
    details: json("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),
    success: boolean("success").default(true).notNull(),
    errorMessage: varchar("error_message", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    actorIdx: index("audit_actor_idx").on(table.actorId, table.actorType),
    resourceIdx: index("audit_resource_idx").on(table.resource, table.resourceId),
    createdAtIdx: index("audit_created_at_idx").on(table.createdAt),
  })
);

export type AuditLogEntry = typeof auditLog.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Problem Tables
// ═══════════════════════════════════════════════════════════════

export const problemTypes = mysqlTable("problem_types", {
  id: serial("id").primaryKey(),
  subtopicId: bigint("subtopic_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => subtopics.id),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProblemType = typeof problemTypes.$inferSelect;

export const problems = mysqlTable("problems", {
  id: serial("id").primaryKey(),
  problemTypeId: bigint("problem_type_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => problemTypes.id),
  order: int("order").notNull(),
  level: mysqlEnum("level", ["basic", "intermediate", "advanced"])
    .default("basic")
    .notNull(),
  source: varchar("source", { length: 255 }),
  condition: text("condition").notNull(),
  given: text("given"),
  find: text("find"),
  solution: text("solution").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Problem = typeof problems.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Resources Table
// ═══════════════════════════════════════════════════════════════

export const resources = mysqlTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["video", "reference", "workbook", "model"]).notNull(),
  url: varchar("url", { length: 500 }),
  tags: varchar("tags", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Virtual Labs System Tables
// ═══════════════════════════════════════════════════════════════

// ── LAB CATEGORIES (Physics Sections) ──
export const labCategories = mysqlTable("lab_categories", {
  id: serial("id").primaryKey(),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  grade: varchar("grade", { length: 50 }),
  description: text("description"),
  shortDesc: varchar("short_desc", { length: 500 }),
  color: varchar("color", { length: 20 }).default("#2eff8c"),
  iconType: varchar("icon_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LabCategory = typeof labCategories.$inferSelect;
export type InsertLabCategory = typeof labCategories.$inferInsert;

// ── LAB SUBCATEGORIES (Physics Sub-sections) ──
export const labSubcategories = mysqlTable("lab_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => labCategories.id, { onDelete: "cascade" }),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LabSubcategory = typeof labSubcategories.$inferSelect;
export type InsertLabSubcategory = typeof labSubcategories.$inferInsert;

// ── LAB WORKS (Virtual Laboratory Works) ──
export const labWorks = mysqlTable("lab_works", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => labCategories.id),
  subcategoryId: bigint("subcategory_id", { mode: "number", unsigned: true })
    .references(() => labSubcategories.id),
  topicNodeId: bigint("topic_node_id", { mode: "number", unsigned: true })
    .references(() => topicNodes.id),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  law: varchar("law", { length: 255 }),
  skills: text("skills"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  duration: int("duration"),
  goal: text("goal"),
  theory: text("theory"),
  equipment: text("equipment"),
  instruction: text("instruction"),
  conclusionTemplate: text("conclusion_template"),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type LabWork = typeof labWorks.$inferSelect;
export type InsertLabWork = typeof labWorks.$inferInsert;

// ── LAB BLOCKS (Content blocks inside a lab work) ──
export const labBlocks = mysqlTable("lab_blocks", {
  id: serial("id").primaryKey(),
  labWorkId: bigint("lab_work_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => labWorks.id, { onDelete: "cascade" }),
  order: int("order").notNull(),
  type: mysqlEnum("type", [
    "theory",
    "simulation",
    "table",
    "graphs",
    "questions",
    "test",
    "conclusion",
    "equipment",
    "goal",
  ]).notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  config: json("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LabBlock = typeof labBlocks.$inferSelect;
export type InsertLabBlock = typeof labBlocks.$inferInsert;

// ── LAB SIMULATION PARAMS (Editable simulation parameters) ──
export const labSimulationParams = mysqlTable("lab_simulation_params", {
  id: serial("id").primaryKey(),
  labWorkId: bigint("lab_work_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => labWorks.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 100 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  paramType: mysqlEnum("param_type", ["slider", "select", "number"]).default("slider").notNull(),
  min: varchar("min", { length: 50 }),
  max: varchar("max", { length: 50 }),
  step: varchar("step", { length: 50 }),
  defaultValue: varchar("default_value", { length: 255 }),
  options: text("options"),
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LabSimulationParam = typeof labSimulationParams.$inferSelect;

// ── LAB PROGRESS (Student progress on lab works) ──
export const labProgress = mysqlTable("lab_progress", {
  id: serial("id").primaryKey(),
  localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => localUsers.id, { onDelete: "cascade" }),
  labWorkId: bigint("lab_work_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => labWorks.id, { onDelete: "cascade" }),
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

// ── LAB ANALYTICS (Usage analytics per lab work) ──
export const labAnalytics = mysqlTable("lab_analytics", {
  id: serial("id").primaryKey(),
  labWorkId: bigint("lab_work_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => labWorks.id, { onDelete: "cascade" }),
  totalRuns: int("total_runs").default(0).notNull(),
  avgDuration: int("avg_duration"),
  completionRate: int("completion_rate").default(0),
  avgResults: json("avg_results"),
  popularRank: int("popular_rank"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type LabAnalytics = typeof labAnalytics.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Jupyter Notebook Tables
// ═══════════════════════════════════════════════════════════════

// ── JUPYTER NOTEBOOKS ──
export const jupyterNotebooks = mysqlTable("jupyter_notebooks", {
  id: serial("id").primaryKey(),
  subtopicId: bigint("subtopic_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => subtopics.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JupyterNotebook = typeof jupyterNotebooks.$inferSelect;

// ── JUPYTER NOTEBOOK ACCESS ──
export const jupyterNotebookAccess = mysqlTable(
  "jupyter_notebook_access",
  {
    id: serial("id").primaryKey(),
    notebookId: bigint("notebook_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => jupyterNotebooks.id, { onDelete: "cascade" }),
    localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => localUsers.id, { onDelete: "cascade" }),
    grantedBy: bigint("granted_by", { mode: "number", unsigned: true }),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueAccess: uniqueIndex("unique_jupyter_access").on(
      table.notebookId,
      table.localUserId
    ),
  })
);

export type JupyterNotebookAccess = typeof jupyterNotebookAccess.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Notifications Table
// ═══════════════════════════════════════════════════════════════

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => localUsers.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["jupyter_notebook", "lab", "general"])
    .default("general")
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  read: boolean("read").default(false).notNull(),
  resourceId: bigint("resource_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
