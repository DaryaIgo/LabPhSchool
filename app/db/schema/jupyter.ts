import {
  mysqlTable,
  serial,
  varchar,
  timestamp,
  bigint,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// Jupyter Notebooks
// ═══════════════════════════════════════════════════════════════

export const jupyterNotebooks = mysqlTable("jupyter_notebooks", {
  id: serial("id").primaryKey(),
  // Soft reference to content.subtopics.id (content domain).
  subtopicId: bigint("subtopic_id", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  // Soft reference to users.id (auth domain).
  uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JupyterNotebook = typeof jupyterNotebooks.$inferSelect;

export const jupyterNotebookAccess = mysqlTable(
  "jupyter_notebook_access",
  {
    id: serial("id").primaryKey(),
    notebookId: bigint("notebook_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => jupyterNotebooks.id, { onDelete: "cascade" }),
    // Soft reference to auth.local_users.id (auth domain).
    localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
      .notNull(),
    // Soft reference to users.id (auth domain).
    grantedBy: bigint("granted_by", { mode: "number", unsigned: true }),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueAccess: uniqueIndex("unique_jupyter_access").on(
      table.notebookId,
      table.localUserId
    ),
  })
);

export type JupyterNotebookAccess = typeof jupyterNotebookAccess.$inferSelect;
