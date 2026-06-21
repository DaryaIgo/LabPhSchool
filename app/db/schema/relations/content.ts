import { relations } from "drizzle-orm";
import { topicNodes } from "../content";

export const topicNodesRelations = relations(topicNodes, ({ one }) => ({
  parent: one(topicNodes, {
    fields: [topicNodes.parentId],
    references: [topicNodes.id],
  }),
}));
