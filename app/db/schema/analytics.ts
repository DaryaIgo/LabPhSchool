/**
 * Analytics Schema — Page visit tracking.
 *
 * Lightweight, self-hosted analytics that complements Yandex.Metrica.
 * No foreign keys to other domains; uses soft references only.
 */

import {
  mysqlTable,
  serial,
  varchar,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const pageVisits = mysqlTable(
  "page_visits",
  {
    id: serial("id").primaryKey(),
    path: varchar("path", { length: 500 }).notNull(),
    referrer: varchar("referrer", { length: 500 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),
    localUserId: bigint("local_user_id", { mode: "number", unsigned: true }),
    visitedAt: timestamp("visited_at").defaultNow().notNull(),
  },
  table => ({
    pathIdx: index("page_visits_path_idx").on(table.path),
    visitedAtIdx: index("page_visits_visited_at_idx").on(table.visitedAt),
    localUserIdx: index("page_visits_local_user_idx").on(table.localUserId),
  })
);

export type PageVisit = typeof pageVisits.$inferSelect;
