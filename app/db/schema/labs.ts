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
  subcategoryId: bigint("subcategory_id", {
    mode: "number",
    unsigned: true,
  }).references(() => labSubcategories.id),
  // Soft reference to content.topic_nodes.id (content domain).
  topicNodeId: bigint("topic_node_id", { mode: "number", unsigned: true }),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  goal: text("goal"),
  theory: text("theory"),
  equipment: text("equipment"),
  instruction: text("instruction"),
  conclusionTemplate: text("conclusion_template"),
  simulationSlug: varchar("simulation_slug", { length: 255 }),
  cardType: mysqlEnum("card_type", ["own", "external"]),
  status: mysqlEnum("status", ["draft", "published"])
    .default("draft")
    .notNull(),
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

// ═══════════════════════════════════════════════════════════════
// Simulation Registry
// ═══════════════════════════════════════════════════════════════

export interface SimulationParamConfig {
  key: string;
  label: string;
  paramType: "slider" | "select" | "number" | "url";
  min?: string;
  max?: string;
  step?: string;
  defaultValue?: string;
  options?: string;
  unit?: string;
}

export const SIMULATION_KINDS = ["own", "external"] as const;
export type SimulationKind = (typeof SIMULATION_KINDS)[number];

export const simulations = mysqlTable("simulations", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  thumbnail: varchar("thumbnail", { length: 500 }),
  componentRef: varchar("component_ref", { length: 100 }).notNull(),
  kind: mysqlEnum("kind", ["own", "external"])
    .default("own")
    .notNull(),
  isDynamic: boolean("is_dynamic").default(false).notNull(),
  config: json("config").$type<SimulationParamConfig[] | null>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = typeof simulations.$inferInsert;

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
