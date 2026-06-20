import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  type AnyMySqlColumn,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Course Content Catalog
// ═══════════════════════════════════════════════════════════════

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
  // Logical link to lab_categories.slug (labs domain). Kept as plain varchar
  // because the labs catalog lives in a separate bounded context.
  labCategorySlug: varchar("lab_category_slug", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type TopicNode = typeof topicNodes.$inferSelect;
export type InsertTopicNode = typeof topicNodes.$inferInsert;

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
