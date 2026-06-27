import { relations } from "drizzle-orm";
import { problemCategories, problemSubcategories, problems } from "../problems";

export const problemCategoriesRelations = relations(
  problemCategories,
  ({ many }) => ({
    subcategories: many(problemSubcategories),
    problems: many(problems),
  })
);

export const problemSubcategoriesRelations = relations(
  problemSubcategories,
  ({ one, many }) => ({
    category: one(problemCategories, {
      fields: [problemSubcategories.categoryId],
      references: [problemCategories.id],
    }),
    problems: many(problems),
  })
);

export const problemsRelations = relations(problems, ({ one }) => ({
  category: one(problemCategories, {
    fields: [problems.categoryId],
    references: [problemCategories.id],
  }),
  subcategory: one(problemSubcategories, {
    fields: [problems.subcategoryId],
    references: [problemSubcategories.id],
  }),
}));
