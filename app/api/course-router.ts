import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { topics, subtopics, labs, resources } from "@db/schema";
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
      if (!topic[0]) return null;

      const subs = await db
        .select()
        .from(subtopics)
        .where(eq(subtopics.topicId, topic[0].id))
        .orderBy(asc(subtopics.order));

      return { ...topic[0], subtopics: subs };
    }),

  subtopicsByTopic: publicQuery
    .input(z.object({ topicId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(subtopics)
        .where(eq(subtopics.topicId, input.topicId))
        .orderBy(asc(subtopics.order));
    }),

  labs: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(labs).orderBy(asc(labs.order));
  }),

  labBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(labs)
        .where(eq(labs.slug, input.slug))
        .limit(1);
      return result[0] ?? null;
    }),

  resources: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(resources);
  }),
});
