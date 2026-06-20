import {
  mysqlTable,
  serial,
  varchar,
  timestamp,
  longtext,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Uploaded Images Storage
// ═══════════════════════════════════════════════════════════════

export const images = mysqlTable("images", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  data: longtext("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;
