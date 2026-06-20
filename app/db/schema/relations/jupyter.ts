import { relations } from "drizzle-orm";
import { jupyterNotebooks, jupyterNotebookAccess } from "../jupyter";

export const jupyterNotebooksRelations = relations(
  jupyterNotebooks,
  ({ many }) => ({
    accesses: many(jupyterNotebookAccess),
  })
);

export const jupyterNotebookAccessRelations = relations(
  jupyterNotebookAccess,
  ({ one }) => ({
    notebook: one(jupyterNotebooks, {
      fields: [jupyterNotebookAccess.notebookId],
      references: [jupyterNotebooks.id],
    }),
  })
);
