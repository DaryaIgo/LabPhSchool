import { relations } from "drizzle-orm";
import {
  labCategories,
  labSubcategories,
  labWorks,
  labBlocks,
  labSimulationParams,
  labAnalytics,
} from "../labs";

export const labCategoriesRelations = relations(labCategories, ({ many }) => ({
  subcategories: many(labSubcategories),
  works: many(labWorks),
}));

export const labSubcategoriesRelations = relations(labSubcategories, ({ one }) => ({
  category: one(labCategories, {
    fields: [labSubcategories.categoryId],
    references: [labCategories.id],
  }),
}));

export const labWorksRelations = relations(labWorks, ({ one, many }) => ({
  category: one(labCategories, {
    fields: [labWorks.categoryId],
    references: [labCategories.id],
  }),
  subcategory: one(labSubcategories, {
    fields: [labWorks.subcategoryId],
    references: [labSubcategories.id],
  }),
  blocks: many(labBlocks),
  simulationParams: many(labSimulationParams),
  analytics: one(labAnalytics),
}));

export const labBlocksRelations = relations(labBlocks, ({ one }) => ({
  labWork: one(labWorks, {
    fields: [labBlocks.labWorkId],
    references: [labWorks.id],
  }),
}));

export const labSimulationParamsRelations = relations(
  labSimulationParams,
  ({ one }) => ({
    labWork: one(labWorks, {
      fields: [labSimulationParams.labWorkId],
      references: [labWorks.id],
    }),
  })
);

export const labAnalyticsRelations = relations(labAnalytics, ({ one }) => ({
  labWork: one(labWorks, {
    fields: [labAnalytics.labWorkId],
    references: [labWorks.id],
  }),
}));
