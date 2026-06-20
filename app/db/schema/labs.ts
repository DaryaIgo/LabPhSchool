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
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Virtual Labs Catalog
// ═══════════════════════════════════════════════════════════════

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

export const labWorks = mysqlTable("lab_works", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => labCategories.id),
  subcategoryId: bigint("subcategory_id", { mode: "number", unsigned: true })
    .references(() => labSubcategories.id),
  // Soft reference to content.topic_nodes.id (content domain).
  topicNodeId: bigint("topic_node_id", { mode: "number", unsigned: true }),
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
