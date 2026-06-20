import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  timestamp,
  bigint,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Audit Log
// ═══════════════════════════════════════════════════════════════

export const auditLog = mysqlTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    // Polymorphic soft reference to an actor in the auth domain.
    actorId: bigint("actor_id", { mode: "number", unsigned: true }).notNull(),
    actorType: mysqlEnum("actor_type", ["user", "local_user"]).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    resource: varchar("resource", { length: 50 }).notNull(),
    // Polymorphic soft reference to a resource in another domain.
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
