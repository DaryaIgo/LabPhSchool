import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getContentDb, getLabsDb } from "./queries/connection";
import {
  topics,
  subtopics,
  resources,
  topicNodes,
  labs,
} from "@db/schema/content";
import { labWorks, labCategories } from "@db/schema/labs";
import { eq, asc, or, like, inArray } from "drizzle-orm";

export const courseRouter = createRouter({
  topics: publicQuery.query(async () => {
    const db = getContentDb();
    return db.select().from(topics).orderBy(asc(topics.order));
  }),

  topicBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getContentDb();
      const topic = await db
        .select()
        .from(topics)
        .where(eq(topics.slug, input.slug))
        .limit(1);
      return topic[0] ?? null;
    }),

  resources: publicQuery.query(async () => {
    const db = getContentDb();
    return db.select().from(resources);
  }),

  // ── Hierarchical Topic Nodes ──
  topicNodes: publicQuery.query(async () => {
    const db = getContentDb();
    return db.select().from(topicNodes).orderBy(asc(topicNodes.order));
  }),

  topicNodeBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getContentDb();
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
    const db = getContentDb();
    return db
      .select()
      .from(subtopics)
      .orderBy(asc(subtopics.topicId), asc(subtopics.order));
  }),

  labs: publicQuery.query(async () => {
    const db = getContentDb();
    return db.select().from(labs).orderBy(asc(labs.topicId), asc(labs.order));
  }),

  // ── Lab works for a topic (new virtual lab system) ──
  topicLabWorks: publicQuery
    .input(z.object({ topicId: z.number().positive() }))
    .query(async ({ input }) => {
      const contentDb = getContentDb();
      const labsDb = getLabsDb();

      const [topic] = await contentDb
        .select()
        .from(topics)
        .where(eq(topics.id, input.topicId))
        .limit(1);
      if (!topic) return [];

      // Find matching topic nodes by slug or title
      const nodes = await contentDb
        .select()
        .from(topicNodes)
        .where(
          or(
            eq(topicNodes.slug, topic.slug),
            like(topicNodes.title, `%${topic.title}%`)
          )
        );

      if (nodes.length === 0) return [];

      const nodeIds = nodes.map((n) => n.id);
      const categorySlugs = nodes
        .map((n) => n.labCategorySlug)
        .filter((s): s is string => !!s);

      let categoryIds: number[] = [];
      if (categorySlugs.length > 0) {
        const cats = await labsDb
          .select({ id: labCategories.id })
          .from(labCategories)
          .where(inArray(labCategories.slug, categorySlugs));
        categoryIds = cats.map((c) => c.id);
      }

      const conditions = [];
      if (nodeIds.length > 0) {
        conditions.push(inArray(labWorks.topicNodeId, nodeIds));
      }
      if (categoryIds.length > 0) {
        conditions.push(inArray(labWorks.categoryId, categoryIds));
      }

      if (conditions.length === 0) return [];

      return labsDb
        .select({
          id: labWorks.id,
          title: labWorks.title,
          slug: labWorks.slug,
          shortDesc: labWorks.goal,
        })
        .from(labWorks)
        .where(or(...conditions))
        .orderBy(asc(labWorks.order));
    }),
});
