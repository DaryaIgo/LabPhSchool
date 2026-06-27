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
//
// topic_nodes is the single source of truth for the course structure.
// Root nodes are course topics; child nodes are subtopics/lessons.
// Legacy tables topics, subtopics and labs have been removed.

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
  // Icon key from CATEGORY_ICONS registry (app/src/lib/lab-icons.ts).
  iconType: varchar("icon_type", { length: 50 }),
  // Optional external Jupyter notebook URL attached to this node.
  jupyterUrl: varchar("jupyter_url", { length: 500 }),
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

export const resources = mysqlTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", [
    "video",
    "reference",
    "workbook",
    "model",
  ]).notNull(),
  url: varchar("url", { length: 500 }),
  tags: varchar("tags", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
