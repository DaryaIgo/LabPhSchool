import { relations } from "drizzle-orm";
import { topics, subtopics, topicNodes, labs } from "../content";

export const topicsRelations = relations(topics, ({ many }) => ({
  subtopics: many(subtopics),
  labs: many(labs),
}));

export const subtopicsRelations = relations(subtopics, ({ one }) => ({
  topic: one(topics, {
    fields: [subtopics.topicId],
    references: [topics.id],
  }),
}));

export const topicNodesRelations = relations(topicNodes, ({ one }) => ({
  parent: one(topicNodes, {
    fields: [topicNodes.parentId],
    references: [topicNodes.id],
  }),
}));

export const labsRelations = relations(labs, ({ one }) => ({
  topic: one(topics, {
    fields: [labs.topicId],
    references: [topics.id],
  }),
}));
