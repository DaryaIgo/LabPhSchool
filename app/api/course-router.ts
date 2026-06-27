import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getContentDb, getLabsDb } from "./queries/connection";
import { resources, topicNodes } from "@db/schema/content";
import { labWorks, labCategories } from "@db/schema/labs";
import { eq, asc, or, like, inArray, isNull, isNotNull } from "drizzle-orm";

export const courseRouter = createRouter({
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

  // List root topic nodes (course topics)
  topics: publicQuery.query(async () => {
    const db = getContentDb();
    return db
      .select()
      .from(topicNodes)
      .where(isNull(topicNodes.parentId))
      .orderBy(asc(topicNodes.order));
  }),

  // List subtopic nodes (children of root topics)
  listSubtopics: publicQuery.query(async () => {
    const db = getContentDb();
    return db
      .select()
      .from(topicNodes)
      .where(isNotNull(topicNodes.parentId))
      .orderBy(asc(topicNodes.parentId), asc(topicNodes.order));
  }),

  // ── Lab works for a topic (new virtual lab system) ──
  topicLabWorks: publicQuery
    .input(z.object({ topicNodeId: z.number().positive() }))
    .query(async ({ input }) => {
      const contentDb = getContentDb();
      const labsDb = getLabsDb();

      const [topic] = await contentDb
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.id, input.topicNodeId))
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

      const nodeIds = nodes.map(n => n.id);
      const categorySlugs = nodes
        .map(n => n.labCategorySlug)
        .filter((s): s is string => !!s);

      let categoryIds: number[] = [];
      if (categorySlugs.length > 0) {
        const cats = await labsDb
          .select({ id: labCategories.id })
          .from(labCategories)
          .where(inArray(labCategories.slug, categorySlugs));
        categoryIds = cats.map(c => c.id);
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
