import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Auth / Identity & Access Management
// ═══════════════════════════════════════════════════════════════

// NOTE: OAuth users table was removed. All authentication is now local:
// - admin_users  → administrators/teachers
// - local_users  → students

export const roles = mysqlTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;

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
  table => ({
    resourceActionIdx: index("resource_action_idx").on(
      table.resource,
      table.action
    ),
  })
);

export type Permission = typeof permissions.$inferSelect;

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
  table => ({
    uniqueRolePermission: uniqueIndex("unique_role_permission").on(
      table.roleId,
      table.permissionId
    ),
  })
);

export type RolePermission = typeof rolePermissions.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// Local administrators / teachers
// ═══════════════════════════════════════════════════════════════

export const adminUsers = mysqlTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    login: varchar("login", { length: 100 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default("admin"),
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
  table => ({
    statusIdx: index("admin_user_status_idx").on(table.status),
  })
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Local students
// ═══════════════════════════════════════════════════════════════

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
    // Soft reference to admin_users.id (auth domain). Kept as plain bigint to avoid
    // coupling if auth tables ever move to a separate database.
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
    moonComment: text("moon_comment"),
    moonCommentUpdatedAt: timestamp("moon_comment_updated_at"),
    moonCommentReadAt: timestamp("moon_comment_read_at"),
    moonCommentFirstOpenedAt: timestamp("moon_comment_first_opened_at"),
    homeworkCommentsReadAt: timestamp("homework_comments_read_at"),
  },
  table => ({
    statusIdx: index("local_user_status_idx").on(table.status),
    createdByIdx: index("local_user_created_by_idx").on(table.createdBy),
  })
);

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;
