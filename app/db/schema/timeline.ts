import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  index,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Timeline of Physicists & Discoveries
// ═══════════════════════════════════════════════════════════════

export const timelineEntries = mysqlTable(
  "timeline_entries",
  {
    id: serial("id").primaryKey(),
    type: mysqlEnum("type", ["physicist", "discovery"]).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    yearStart: int("year_start").notNull(),
    yearEnd: int("year_end"),
    description: text("description").notNull(),
    portraitUrl: varchar("portrait_url", { length: 500 }),
    color: varchar("color", { length: 20 }).default("#01acff").notNull(),
    sortOrder: int("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    typeIdx: index("timeline_type_idx").on(table.type),
    yearIdx: index("timeline_year_idx").on(table.yearStart),
  })
);

export type TimelineEntry = typeof timelineEntries.$inferSelect;
export type InsertTimelineEntry = typeof timelineEntries.$inferInsert;
