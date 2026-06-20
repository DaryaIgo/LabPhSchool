import { relations } from "drizzle-orm";
import { problemTypes, problems } from "../problems";

export const problemTypesRelations = relations(problemTypes, ({ many }) => ({
  problems: many(problems),
}));

export const problemsRelations = relations(problems, ({ one }) => ({
  problemType: one(problemTypes, {
    fields: [problems.problemTypeId],
    references: [problemTypes.id],
  }),
}));
