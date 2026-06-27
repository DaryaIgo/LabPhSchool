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
// Problems Bank (admin-only)
//
// Hierarchical structure inspired by labs:
// problem_categories -> problem_subcategories -> problems
// ═══════════════════════════════════════════════════════════════

export const problemCategories = mysqlTable("problem_categories", {
  id: serial("id").primaryKey(),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#ffcb3d"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProblemCategory = typeof problemCategories.$inferSelect;

export const problemSubcategories = mysqlTable("problem_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => problemCategories.id),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProblemSubcategory = typeof problemSubcategories.$inferSelect;

export const problems = mysqlTable("problems", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => problemCategories.id),
  subcategoryId: bigint("subcategory_id", {
    mode: "number",
    unsigned: true,
  }).references(() => problemSubcategories.id),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"])
    .default("medium")
    .notNull(),
  source: varchar("source", { length: 255 }),
  condition: text("condition").notNull(),
  solution: text("solution").notNull(),
  answer: text("answer").notNull(),
  status: mysqlEnum("status", ["draft", "published"])
    .default("draft")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Problem = typeof problems.$inferSelect;
