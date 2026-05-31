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
  subtopics,
  labs,
  problems,
  problemTypes,
  localUsers,
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
    const [subtopicCount] = await db.select({ count: count() }).from(subtopics);
    const [labCount] = await db.select({ count: count() }).from(labs);

    return {
      students: {
        total: studentCount.count,
        active: activeCount.count,
        suspended: suspendedCount.count,
      },
      content: {
        topics: topicCount.count,
        subtopics: subtopicCount.count,
        labs: labCount.count,
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
  // SUBTOPICS CRUD
  // ═══════════════════════════════════════════════════════════

  listSubtopics: adminQuery
    .input(z.object({ topicId: z.number().positive() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(subtopics)
        .where(eq(subtopics.topicId, input.topicId))
        .orderBy(asc(subtopics.order));
    }),

  createSubtopic: adminQuery
    .input(
      z.object({
        topicId: z.number().positive(),
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
        content: z.string().max(50000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(subtopics).values({
        topicId: input.topicId,
        order: input.order,
        title: input.title,
        description: input.description ?? null,
        content: input.content ?? null,
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "subtopics",
        resourceId: id,
        details: { title: input.title, topicId: input.topicId },
      });

      return { id, success: true };
    }),

  updateSubtopic: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).optional(),
        content: z.string().max(50000).optional(),
        order: z.number().int().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.order !== undefined) updateData.order = data.order;

      await db.update(subtopics).set(updateData).where(eq(subtopics.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "subtopics",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  deleteSubtopic: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getDb().delete(subtopics).where(eq(subtopics.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "subtopics",
        resourceId: input.id,
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // LABS CRUD
  // ═══════════════════════════════════════════════════════════

  listLabs: adminQuery.query(async () => {
    return getDb().select().from(labs).orderBy(asc(labs.order));
  }),

  createLab: adminQuery
    .input(
      z.object({
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        description: z.string().max(5000).optional(),
        shortDesc: z.string().max(500).optional(),
        theory: z.string().max(50000).optional(),
        iconType: z.string().max(50).optional(),
        topicId: z.number().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(labs).values({
        order: input.order,
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        shortDesc: input.shortDesc ?? null,
        theory: input.theory ?? null,
        iconType: input.iconType ?? null,
        topicId: input.topicId ?? null,
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "labs",
        resourceId: id,
        details: { title: input.title, slug: input.slug },
      });

      return { id, success: true };
    }),

  updateLab: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        shortDesc: z.string().max(500).optional(),
        theory: z.string().max(50000).optional(),
        iconType: z.string().max(50).optional(),
        order: z.number().int().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.shortDesc !== undefined) updateData.shortDesc = data.shortDesc;
      if (data.theory !== undefined) updateData.theory = data.theory;
      if (data.iconType !== undefined) updateData.iconType = data.iconType;
      if (data.order !== undefined) updateData.order = data.order;

      await db.update(labs).set(updateData).where(eq(labs.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "labs",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  deleteLab: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getDb().delete(labs).where(eq(labs.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "labs",
        resourceId: input.id,
      });

      return { success: true };
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

  createProblemType: adminQuery
    .input(
      z.object({
        subtopicId: z.number().positive(),
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        description: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(problemTypes).values({
        subtopicId: input.subtopicId,
        order: input.order,
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "problem_types",
        resourceId: id,
      });

      return { id, success: true };
    }),
});
