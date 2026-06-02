import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { topics, subtopics, resources, topicNodes, labs } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const courseRouter = createRouter({
  topics: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(topics).orderBy(asc(topics.order));
  }),

  topicBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const topic = await db
        .select()
        .from(topics)
        .where(eq(topics.slug, input.slug))
        .limit(1);
      return topic[0] ?? null;
    }),

  resources: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(resources);
  }),

  // ── Hierarchical Topic Nodes ──
  topicNodes: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(topicNodes).orderBy(asc(topicNodes.order));
  }),

  topicNodeBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const node = await db
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.slug, input.slug))
        .limit(1);
      if (!node[0]) return null;
      const children = await db
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.parentId, node[0].id))
        .orderBy(asc(topicNodes.order));
      return { ...node[0], children };
    }),

  listSubtopics: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(subtopics).orderBy(asc(subtopics.topicId), asc(subtopics.order));
  }),

  labs: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(labs).orderBy(asc(labs.topicId), asc(labs.order));
  }),
});
