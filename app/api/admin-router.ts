/**
 * Admin Router — CMS & User Management
 *
 * All endpoints require adminQuery middleware (admin role).
 * Operations are protected by RBAC and logged to audit_log.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  topics,
  problems,
  localUsers,
  topicNodes,
  labWorks,
} from "@db/schema";
import { eq, asc, count } from "drizzle-orm";
import { createAuditEntry } from "./queries/audit";

export const adminRouter = createRouter({
  // ═══════════════════════════════════════════════════════════
  // Dashboard Statistics
  // ═══════════════════════════════════════════════════════════

  dashboardStats: adminQuery.query(async () => {
    const db = getDb();

    const [studentCount] = await db
      .select({ count: count() })
      .from(localUsers);
    const [activeCount] = await db
      .select({ count: count() })
      .from(localUsers)
      .where(eq(localUsers.status, "active"));
    const [suspendedCount] = await db
      .select({ count: count() })
      .from(localUsers)
      .where(eq(localUsers.status, "suspended"));
    const [topicCount] = await db.select({ count: count() }).from(topics);
    const [labWorkCount] = await db.select({ count: count() }).from(labWorks);

    return {
      students: {
        total: studentCount.count,
        active: activeCount.count,
        suspended: suspendedCount.count,
      },
      content: {
        topics: topicCount.count,
        labWorks: labWorkCount.count,
      },
    };
  }),

  // ═══════════════════════════════════════════════════════════
  // TOPICS CRUD
  // ═══════════════════════════════════════════════════════════

  listTopics: adminQuery.query(async () => {
    return getDb().select().from(topics).orderBy(asc(topics.order));
  }),

  createTopic: adminQuery
    .input(
      z.object({
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        formula: z.string().max(500).optional(),
        description: z.string().max(5000).optional(),
        shortDesc: z.string().max(500).optional(),
        color: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(topics).values({
        order: input.order,
        title: input.title,
        slug: input.slug,
        formula: input.formula ?? null,
        description: input.description ?? null,
        shortDesc: input.shortDesc ?? null,
        color: input.color ?? "#2eff8c",
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "topics",
        resourceId: id,
        details: { title: input.title, slug: input.slug },
      });

      return { id, success: true };
    }),

  updateTopic: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1).max(255).optional(),
        formula: z.string().max(500).optional(),
        description: z.string().max(5000).optional(),
        shortDesc: z.string().max(500).optional(),
        color: z.string().max(20).optional(),
        order: z.number().int().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.formula !== undefined) updateData.formula = data.formula;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.shortDesc !== undefined) updateData.shortDesc = data.shortDesc;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.order !== undefined) updateData.order = data.order;

      await db.update(topics).set(updateData).where(eq(topics.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "topics",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  deleteTopic: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getDb().delete(topics).where(eq(topics.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "topics",
        resourceId: input.id,
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // TOPIC NODES CRUD (hierarchical markdown topics)
  // ═══════════════════════════════════════════════════════════

  listTopicNodes: adminQuery.query(async () => {
    return getDb().select().from(topicNodes).orderBy(asc(topicNodes.order));
  }),

  getTopicNode: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const node = await db
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.id, input.id))
        .limit(1);
      if (!node[0]) return null;
      const children = await db
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.parentId, input.id))
        .orderBy(asc(topicNodes.order));
      return { ...node[0], children };
    }),

  createTopicNode: adminQuery
    .input(
      z.object({
        parentId: z.number().positive().optional(),
        order: z.number().int().min(1).default(1),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        content: z.string().max(100000).optional(),
        color: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(topicNodes).values({
        parentId: input.parentId ?? null,
        order: input.order,
        title: input.title,
        slug: input.slug,
        content: input.content ?? null,
        color: input.color ?? null,
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "topic_nodes",
        resourceId: id,
        details: { title: input.title, slug: input.slug, parentId: input.parentId },
      });
      return { id, success: true };
    }),

  updateTopicNode: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        parentId: z.number().positive().optional().nullable(),
        order: z.number().int().min(1).optional(),
        title: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
        content: z.string().max(100000).optional(),
        color: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.parentId !== undefined) updateData.parentId = data.parentId;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.color !== undefined) updateData.color = data.color;

      await db.update(topicNodes).set(updateData).where(eq(topicNodes.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "topic_nodes",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  deleteTopicNode: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const allNodes = await db
        .select({ id: topicNodes.id, parentId: topicNodes.parentId })
        .from(topicNodes);
      const childrenMap = new Map<number, number[]>();
      for (const n of allNodes) {
        if (n.parentId) {
          const arr = childrenMap.get(n.parentId) ?? [];
          arr.push(n.id);
          childrenMap.set(n.parentId, arr);
        }
      }
      const toDelete: number[] = [];
      const collect = (nodeId: number) => {
        toDelete.push(nodeId);
        const children = childrenMap.get(nodeId) ?? [];
        for (const childId of children) collect(childId);
      };
      collect(input.id);
      // Delete leaves first to avoid FK constraint violations
      for (let i = toDelete.length - 1; i >= 0; i--) {
        await db.delete(topicNodes).where(eq(topicNodes.id, toDelete[i]));
      }

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "topic_nodes",
        resourceId: input.id,
        details: { deletedCount: toDelete.length },
      });

      return { success: true, deletedCount: toDelete.length };
    }),

  importTopicNode: adminQuery
    .input(
      z.object({
        parentId: z.number().positive().optional(),
        markdown: z.string().min(1).max(200000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { default: matter } = await import("gray-matter");
      const parsed = matter(input.markdown);
      const front = parsed.data as Record<string, unknown>;

      const title = String(front.title ?? "");
      const slug = String(front.slug ?? "");
      if (!title || !slug) {
        throw new Error("Front matter must include 'title' and 'slug'");
      }

      const db = getDb();
      const result = await db.insert(topicNodes).values({
        parentId: input.parentId ?? null,
        order: Number(front.order ?? 1),
        title,
        slug,
        content: parsed.content || null,
        color: front.color ? String(front.color) : null,
      });
      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "topic_nodes",
        resourceId: id,
        details: { title, slug, source: "import" },
      });

      return { id, success: true };
    }),

  exportTopicNode: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const node = await db
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.id, input.id))
        .limit(1);
      if (!node[0]) return null;
      const n = node[0];
      const frontMatter = [
        "---",
        `title: "${n.title}"`,
        `slug: ${n.slug}`,
        `order: ${n.order}`,
        n.color ? `color: "${n.color}"` : null,
        "---",
        "",
        n.content ?? "",
      ]
        .filter(Boolean)
        .join("\n");
      return { markdown: frontMatter, filename: `${n.slug}.md` };
    }),

  // ═══════════════════════════════════════════════════════════
  // PROBLEMS CRUD
  // ═══════════════════════════════════════════════════════════

  createProblem: adminQuery
    .input(
      z.object({
        problemTypeId: z.number().positive(),
        order: z.number().int().min(1),
        level: z.enum(["basic", "intermediate", "advanced"]),
        source: z.string().max(255).optional(),
        condition: z.string().min(1).max(10000),
        given: z.string().max(5000).optional(),
        find: z.string().max(2000).optional(),
        solution: z.string().min(1).max(20000),
        answer: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(problems).values({
        problemTypeId: input.problemTypeId,
        order: input.order,
        level: input.level,
        source: input.source ?? null,
        condition: input.condition,
        given: input.given ?? null,
        find: input.find ?? null,
        solution: input.solution,
        answer: input.answer,
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "problems",
        resourceId: id,
      });

      return { id, success: true };
    }),

  updateProblem: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        condition: z.string().max(10000).optional(),
        given: z.string().max(5000).optional(),
        find: z.string().max(2000).optional(),
        solution: z.string().max(20000).optional(),
        answer: z.string().max(5000).optional(),
        source: z.string().max(255).optional(),
        level: z.enum(["basic", "intermediate", "advanced"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.condition !== undefined) updateData.condition = data.condition;
      if (data.given !== undefined) updateData.given = data.given;
      if (data.find !== undefined) updateData.find = data.find;
      if (data.solution !== undefined) updateData.solution = data.solution;
      if (data.answer !== undefined) updateData.answer = data.answer;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.level !== undefined) updateData.level = data.level;

      await db.update(problems).set(updateData).where(eq(problems.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "problems",
        resourceId: id,
      });

      return { success: true };
    }),

  deleteProblem: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getDb().delete(problems).where(eq(problems.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "problems",
        resourceId: input.id,
      });

      return { success: true };
    }),

});
