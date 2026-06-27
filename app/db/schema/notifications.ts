import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  boolean,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════════════════════════

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  // Soft reference to auth.local_users.id (auth domain).
  localUserId: bigint("local_user_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  type: mysqlEnum("type", ["jupyter_notebook", "lab", "problem", "general"])
    .default("general")
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  read: boolean("read").default(false).notNull(),
  // Polymorphic soft reference to a resource in another domain.
  resourceId: bigint("resource_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
