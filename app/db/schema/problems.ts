import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Problems Bank
// ═══════════════════════════════════════════════════════════════

export const problemTypes = mysqlTable("problem_types", {
  id: serial("id").primaryKey(),
  // Soft reference to content.topic_nodes.id (content domain).
  subtopicNodeId: bigint("subtopic_node_id", { mode: "number", unsigned: true }).notNull(),
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
