/**
 * Virtual Lab Router
 *
 * Public endpoints for browsing lab categories and lab works.
 * Student endpoints for progress tracking.
 * Admin endpoints for CRUD and analytics.
 */

import { z } from "zod";
import {
  createRouter,
  publicQuery,
  adminQuery,
  studentQuery,
} from "./middleware";
import { LAB_CATEGORY_ICON_KEYS } from "@contracts/constants";
import { getLabsDb, getLearningDb, getContentDb } from "./queries/connection";
import {
  labCategories,
  labSubcategories,
  labWorks,
  labBlocks,
  labAnalytics,
  simulations,
  type SimulationParamConfig,
} from "@db/schema/labs";
import { labProgress } from "@db/schema/learning";
import { topicNodes } from "@db/schema/content";
import { eq, asc, count, and, inArray } from "drizzle-orm";
import { createAuditEntry } from "./queries/audit";

export const virtualLabRouter = createRouter({
  // ═══════════════════════════════════════════════════════════
  // PUBLIC: Lab Categories
  // ═══════════════════════════════════════════════════════════

  listCategories: publicQuery.query(async () => {
    const db = getLabsDb();
    const categories = await db
      .select()
      .from(labCategories)
      .orderBy(asc(labCategories.order));

    // Count labs per category
    const counts = await db
      .select({
        categoryId: labWorks.categoryId,
        count: count(),
      })
      .from(labWorks)
      .groupBy(labWorks.categoryId);

    const countMap = new Map(counts.map(c => [c.categoryId, c.count]));

    return categories.map(cat => ({
      ...cat,
      labCount: countMap.get(cat.id) ?? 0,
    }));
  }),

  categoryBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getLabsDb();
      const cat = await db
        .select()
        .from(labCategories)
        .where(eq(labCategories.slug, input.slug))
        .limit(1);
      if (!cat[0]) return null;

      const subs = await db
        .select()
        .from(labSubcategories)
        .where(eq(labSubcategories.categoryId, cat[0].id))
        .orderBy(asc(labSubcategories.order));

      return { ...cat[0], subcategories: subs };
    }),

  listSubcategories: publicQuery
    .input(z.object({ categoryId: z.number().positive() }))
    .query(async ({ input }) => {
      return getLabsDb()
        .select()
        .from(labSubcategories)
        .where(eq(labSubcategories.categoryId, input.categoryId))
        .orderBy(asc(labSubcategories.order));
    }),

  // ═══════════════════════════════════════════════════════════
  // PUBLIC: Lab Works
  // ═══════════════════════════════════════════════════════════

  listLabWorks: publicQuery
    .input(
      z
        .object({
          categoryId: z.number().positive().optional(),
          subcategoryId: z.number().positive().optional(),
          status: z.enum(["draft", "published"]).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getLabsDb();
      const query = db
        .select({
          id: labWorks.id,
          categoryId: labWorks.categoryId,
          subcategoryId: labWorks.subcategoryId,
          order: labWorks.order,
          title: labWorks.title,
          slug: labWorks.slug,
          goal: labWorks.goal,
          theory: labWorks.theory,
          equipment: labWorks.equipment,
          instruction: labWorks.instruction,
          conclusionTemplate: labWorks.conclusionTemplate,
          simulationSlug: labWorks.simulationSlug,
          status: labWorks.status,
          categoryTitle: labCategories.title,
          subcategoryTitle: labSubcategories.title,
        })
        .from(labWorks)
        .leftJoin(labCategories, eq(labWorks.categoryId, labCategories.id))
        .leftJoin(
          labSubcategories,
          eq(labWorks.subcategoryId, labSubcategories.id)
        )
        .orderBy(asc(labWorks.order));

      // Apply filters in memory since drizzle join filters can be tricky
      const results = await query;
      return results.filter(r => {
        if (input?.categoryId && r.categoryId !== input.categoryId)
          return false;
        if (input?.subcategoryId && r.subcategoryId !== input.subcategoryId)
          return false;
        if (input?.status && r.status !== input.status) return false;
        return true;
      });
    }),

  labWorkBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const labsDb = getLabsDb();
      const work = await labsDb
        .select({
          id: labWorks.id,
          categoryId: labWorks.categoryId,
          subcategoryId: labWorks.subcategoryId,
          topicNodeId: labWorks.topicNodeId,
          order: labWorks.order,
          title: labWorks.title,
          slug: labWorks.slug,
          goal: labWorks.goal,
          theory: labWorks.theory,
          equipment: labWorks.equipment,
          instruction: labWorks.instruction,
          conclusionTemplate: labWorks.conclusionTemplate,
          simulationSlug: labWorks.simulationSlug,
          status: labWorks.status,
          categoryTitle: labCategories.title,
          subcategoryTitle: labSubcategories.title,
        })
        .from(labWorks)
        .leftJoin(labCategories, eq(labWorks.categoryId, labCategories.id))
        .leftJoin(
          labSubcategories,
          eq(labWorks.subcategoryId, labSubcategories.id)
        )
        .where(eq(labWorks.slug, input.slug))
        .limit(1);
      if (!work[0]) return null;

      const blocks = await labsDb
        .select()
        .from(labBlocks)
        .where(eq(labBlocks.labWorkId, work[0].id))
        .orderBy(asc(labBlocks.order));

      // Pull theory from linked course topic node if available
      let topicNodeContent: string | null = null;
      if (work[0].topicNodeId) {
        const node = await getContentDb()
          .select({ content: topicNodes.content })
          .from(topicNodes)
          .where(eq(topicNodes.id, work[0].topicNodeId))
          .limit(1);
        if (node[0]?.content) {
          topicNodeContent = node[0].content;
        }
      }

      const simulation = work[0].simulationSlug
        ? await labsDb
            .select()
            .from(simulations)
            .where(eq(simulations.slug, work[0].simulationSlug))
            .limit(1)
            .then(rows => rows[0] ?? null)
        : null;

      const params =
        (simulation?.config as SimulationParamConfig[] | null) ?? [];

      return { ...work[0], blocks, params, topicNodeContent, simulation };
    }),

  // ═══════════════════════════════════════════════════════════
  // STUDENT: Progress
  // ═══════════════════════════════════════════════════════════

  getMyLabProgress: studentQuery
    .input(z.object({ labWorkId: z.number().positive() }).optional())
    .query(async ({ ctx, input }) => {
      const learningDb = getLearningDb();
      const labsDb = getLabsDb();
      const userId = ctx.localUser!.id;

      if (input?.labWorkId) {
        const rows = await learningDb
          .select()
          .from(labProgress)
          .where(
            and(
              eq(labProgress.localUserId, userId),
              eq(labProgress.labWorkId, input.labWorkId)
            )
          )
          .limit(1);
        return rows[0] ?? null;
      }

      const progressRows = await learningDb
        .select()
        .from(labProgress)
        .where(eq(labProgress.localUserId, userId));

      const labWorkIds = progressRows.map(p => p.labWorkId);
      const labWorksMap = new Map<number, typeof labWorks.$inferSelect>();
      if (labWorkIds.length > 0) {
        const works = await labsDb
          .select()
          .from(labWorks)
          .where(inArray(labWorks.id, labWorkIds));
        for (const w of works) labWorksMap.set(w.id, w);
      }

      return progressRows.map(p => ({
        id: p.id,
        localUserId: p.localUserId,
        labWorkId: p.labWorkId,
        mode: p.mode,
        status: p.status,
        data: p.data,
        measurements: p.measurements,
        conclusion: p.conclusion,
        startedAt: p.startedAt,
        completedAt: p.completedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        categoryId: labWorksMap.get(p.labWorkId)?.categoryId ?? null,
      }));
    }),

  saveLabProgress: studentQuery
    .input(
      z.object({
        labWorkId: z.number().positive(),
        mode: z.enum(["training", "self"]),
        status: z.enum([
          "not_started",
          "in_progress",
          "completed",
          "submitted",
        ]),
        data: z.record(z.string(), z.unknown()).optional(),
        measurements: z.array(z.record(z.string(), z.unknown())).optional(),
        conclusion: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLearningDb();
      const userId = ctx.localUser!.id;

      const existing = await db
        .select()
        .from(labProgress)
        .where(
          and(
            eq(labProgress.localUserId, userId),
            eq(labProgress.labWorkId, input.labWorkId)
          )
        )
        .limit(1);

      if (existing[0]) {
        await db
          .update(labProgress)
          .set({
            mode: input.mode,
            status: input.status,
            data: input.data ?? existing[0].data,
            measurements: input.measurements ?? existing[0].measurements,
            conclusion: input.conclusion ?? existing[0].conclusion,
            completedAt:
              input.status === "completed" || input.status === "submitted"
                ? new Date()
                : existing[0].completedAt,
          })
          .where(eq(labProgress.id, existing[0].id));
        return { id: existing[0].id, updated: true };
      }

      const result = await db.insert(labProgress).values({
        localUserId: userId,
        labWorkId: input.labWorkId,
        mode: input.mode,
        status: input.status,
        data: input.data ?? null,
        measurements: input.measurements ?? null,
        conclusion: input.conclusion ?? null,
        startedAt: new Date(),
        completedAt:
          input.status === "completed" || input.status === "submitted"
            ? new Date()
            : null,
      });

      return { id: Number(result[0].insertId), created: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Lab Categories CRUD
  // ═══════════════════════════════════════════════════════════

  adminListCategories: adminQuery.query(async () => {
    return getLabsDb()
      .select()
      .from(labCategories)
      .orderBy(asc(labCategories.order));
  }),

  adminCreateCategory: adminQuery
    .input(
      z.object({
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[a-z0-9-]+$/),
        grade: z.string().max(50).optional(),
        description: z.string().max(5000).optional(),
        shortDesc: z.string().max(500).optional(),
        color: z.string().max(20).optional(),
        iconType: z.enum([...LAB_CATEGORY_ICON_KEYS]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const result = await db.insert(labCategories).values({
        order: input.order,
        title: input.title,
        slug: input.slug,
        grade: input.grade ?? null,
        description: input.description ?? null,
        shortDesc: input.shortDesc ?? null,
        color: input.color ?? "#2eff8c",
        iconType: input.iconType ?? null,
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "lab_categories",
        resourceId: id,
        details: { title: input.title, slug: input.slug },
      });
      return { id, success: true };
    }),

  adminUpdateCategory: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        order: z.number().int().min(1).optional(),
        title: z.string().min(1).max(255).optional(),
        grade: z.string().max(50).optional(),
        description: z.string().max(5000).optional(),
        shortDesc: z.string().max(500).optional(),
        color: z.string().max(20).optional(),
        iconType: z.enum([...LAB_CATEGORY_ICON_KEYS]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.grade !== undefined) updateData.grade = data.grade;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.shortDesc !== undefined) updateData.shortDesc = data.shortDesc;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.iconType !== undefined) updateData.iconType = data.iconType;

      await db
        .update(labCategories)
        .set(updateData)
        .where(eq(labCategories.id, id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "lab_categories",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });
      return { success: true };
    }),

  adminDeleteCategory: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getLabsDb()
        .delete(labCategories)
        .where(eq(labCategories.id, input.id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "lab_categories",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Lab Subcategories CRUD
  // ═══════════════════════════════════════════════════════════

  adminListSubcategories: adminQuery
    .input(z.object({ categoryId: z.number().positive() }).optional())
    .query(async ({ input }) => {
      const db = getLabsDb();
      if (input?.categoryId) {
        return db
          .select()
          .from(labSubcategories)
          .where(eq(labSubcategories.categoryId, input.categoryId))
          .orderBy(asc(labSubcategories.order));
      }
      return db
        .select()
        .from(labSubcategories)
        .orderBy(asc(labSubcategories.order));
    }),

  adminCreateSubcategory: adminQuery
    .input(
      z.object({
        categoryId: z.number().positive(),
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        description: z.string().max(5000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const result = await db.insert(labSubcategories).values({
        categoryId: input.categoryId,
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
        resource: "lab_subcategories",
        resourceId: id,
        details: { title: input.title, slug: input.slug },
      });
      return { id, success: true };
    }),

  adminUpdateSubcategory: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        order: z.number().int().min(1).optional(),
        title: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.description !== undefined)
        updateData.description = data.description;

      await db
        .update(labSubcategories)
        .set(updateData)
        .where(eq(labSubcategories.id, id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "lab_subcategories",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });
      return { success: true };
    }),

  adminDeleteSubcategory: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getLabsDb()
        .delete(labSubcategories)
        .where(eq(labSubcategories.id, input.id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "lab_subcategories",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Lab Works CRUD
  // ═══════════════════════════════════════════════════════════

  adminListLabWorks: adminQuery.query(async () => {
    const db = getLabsDb();
    return db
      .select({
        id: labWorks.id,
        categoryId: labWorks.categoryId,
        subcategoryId: labWorks.subcategoryId,
        order: labWorks.order,
        title: labWorks.title,
        slug: labWorks.slug,
        goal: labWorks.goal,
        theory: labWorks.theory,
        equipment: labWorks.equipment,
        instruction: labWorks.instruction,
        conclusionTemplate: labWorks.conclusionTemplate,
        simulationSlug: labWorks.simulationSlug,
        status: labWorks.status,
        categoryTitle: labCategories.title,
        subcategoryTitle: labSubcategories.title,
      })
      .from(labWorks)
      .leftJoin(labCategories, eq(labWorks.categoryId, labCategories.id))
      .leftJoin(
        labSubcategories,
        eq(labWorks.subcategoryId, labSubcategories.id)
      )
      .orderBy(asc(labWorks.order));
  }),

  adminCreateLabWork: adminQuery
    .input(
      z.object({
        categoryId: z.number().positive(),
        subcategoryId: z.number().positive().optional(),
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[a-z0-9-]+$/),
        goal: z.string().max(5000).optional(),
        theory: z.string().max(50000).optional(),
        equipment: z.string().max(5000).optional(),
        instruction: z.string().max(50000).optional(),
        conclusionTemplate: z.string().max(5000).optional(),
        simulationSlug: z.string().max(255).optional(),
        status: z.enum(["draft", "published"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const result = await db.insert(labWorks).values({
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId ?? null,
        order: input.order,
        title: input.title,
        slug: input.slug,
        goal: input.goal ?? null,
        theory: input.theory ?? null,
        equipment: input.equipment ?? null,
        instruction: input.instruction ?? null,
        conclusionTemplate: input.conclusionTemplate ?? null,
        simulationSlug: input.simulationSlug ?? null,
        status: input.status ?? "draft",
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "lab_works",
        resourceId: id,
        details: { title: input.title, slug: input.slug },
      });
      return { id, success: true };
    }),

  adminUpdateLabWork: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        categoryId: z.number().positive().optional(),
        subcategoryId: z.number().positive().optional().nullable(),
        order: z.number().int().min(1).optional(),
        title: z.string().min(1).max(255).optional(),
        goal: z.string().max(5000).optional(),
        theory: z.string().max(50000).optional(),
        equipment: z.string().max(5000).optional(),
        instruction: z.string().max(50000).optional(),
        conclusionTemplate: z.string().max(5000).optional(),
        simulationSlug: z.string().max(255).optional().nullable(),
        status: z.enum(["draft", "published"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.categoryId !== undefined)
        updateData.categoryId = data.categoryId;
      if (data.subcategoryId !== undefined)
        updateData.subcategoryId = data.subcategoryId;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.goal !== undefined) updateData.goal = data.goal;
      if (data.theory !== undefined) updateData.theory = data.theory;
      if (data.equipment !== undefined) updateData.equipment = data.equipment;
      if (data.instruction !== undefined)
        updateData.instruction = data.instruction;
      if (data.conclusionTemplate !== undefined)
        updateData.conclusionTemplate = data.conclusionTemplate;
      if (data.simulationSlug !== undefined)
        updateData.simulationSlug = data.simulationSlug;
      if (data.status !== undefined) updateData.status = data.status;

      await db.update(labWorks).set(updateData).where(eq(labWorks.id, id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "lab_works",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });
      return { success: true };
    }),

  adminDeleteLabWork: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getLabsDb().delete(labWorks).where(eq(labWorks.id, input.id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "lab_works",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Lab Blocks CRUD
  // ═══════════════════════════════════════════════════════════

  adminListBlocks: adminQuery
    .input(z.object({ labWorkId: z.number().positive() }))
    .query(async ({ input }) => {
      return getLabsDb()
        .select()
        .from(labBlocks)
        .where(eq(labBlocks.labWorkId, input.labWorkId))
        .orderBy(asc(labBlocks.order));
    }),

  adminCreateBlock: adminQuery
    .input(
      z.object({
        labWorkId: z.number().positive(),
        order: z.number().int().min(1),
        type: z.enum([
          "theory",
          "simulation",
          "table",
          "graphs",
          "questions",
          "test",
          "conclusion",
          "equipment",
          "goal",
        ]),
        title: z.string().max(255).optional(),
        content: z.string().max(50000).optional(),
        config: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const result = await db.insert(labBlocks).values({
        labWorkId: input.labWorkId,
        order: input.order,
        type: input.type,
        title: input.title ?? null,
        content: input.content ?? null,
        config: input.config ?? null,
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "lab_blocks",
        resourceId: id,
        details: { labWorkId: input.labWorkId, type: input.type },
      });
      return { id, success: true };
    }),

  adminUpdateBlock: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        order: z.number().int().min(1).optional(),
        type: z
          .enum([
            "theory",
            "simulation",
            "table",
            "graphs",
            "questions",
            "test",
            "conclusion",
            "equipment",
            "goal",
          ])
          .optional(),
        title: z.string().max(255).optional(),
        content: z.string().max(50000).optional(),
        config: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.order !== undefined) updateData.order = data.order;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.config !== undefined) updateData.config = data.config;

      await db.update(labBlocks).set(updateData).where(eq(labBlocks.id, id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "lab_blocks",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });
      return { success: true };
    }),

  adminDeleteBlock: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getLabsDb().delete(labBlocks).where(eq(labBlocks.id, input.id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "lab_blocks",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Simulation Registry CRUD
  // ═══════════════════════════════════════════════════════════

  listSimulations: publicQuery.query(async () => {
    return getLabsDb()
      .select()
      .from(simulations)
      .where(eq(simulations.isActive, true))
      .orderBy(asc(simulations.title));
  }),

  adminListSimulations: adminQuery.query(async () => {
    return getLabsDb()
      .select()
      .from(simulations)
      .orderBy(asc(simulations.category), asc(simulations.title));
  }),

  adminCreateSimulation: adminQuery
    .input(
      z.object({
        slug: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[a-z0-9-]+$/),
        title: z.string().min(1).max(255),
        description: z.string().max(5000).optional(),
        category: z.string().max(50).optional(),
        thumbnail: z.string().max(500).optional(),
        componentRef: z.string().min(1).max(100),
        kind: z.enum(["own", "external"]).optional(),
        isDynamic: z.boolean().optional(),
        config: z
          .array(
            z.object({
              key: z.string(),
              label: z.string(),
              paramType: z.enum(["slider", "select", "number"]),
              min: z.string().optional(),
              max: z.string().optional(),
              step: z.string().optional(),
              defaultValue: z.string().optional(),
              options: z.string().optional(),
              unit: z.string().optional(),
            })
          )
          .optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const result = await db.insert(simulations).values({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? null,
        thumbnail: input.thumbnail ?? null,
        componentRef: input.componentRef,
        kind: input.kind ?? "own",
        isDynamic: input.isDynamic ?? false,
        config: input.config ?? null,
        isActive: input.isActive ?? true,
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "simulations",
        resourceId: id,
        details: { slug: input.slug, title: input.title },
      });
      return { id, success: true };
    }),

  adminUpdateSimulation: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        category: z.string().max(50).optional(),
        thumbnail: z.string().max(500).optional(),
        componentRef: z.string().min(1).max(100).optional(),
        kind: z.enum(["own", "external"]).optional(),
        isDynamic: z.boolean().optional(),
        config: z
          .array(
            z.object({
              key: z.string(),
              label: z.string(),
              paramType: z.enum(["slider", "select", "number"]),
              min: z.string().optional(),
              max: z.string().optional(),
              step: z.string().optional(),
              defaultValue: z.string().optional(),
              options: z.string().optional(),
              unit: z.string().optional(),
            })
          )
          .optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getLabsDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
      if (data.componentRef !== undefined)
        updateData.componentRef = data.componentRef;
      if (data.kind !== undefined) updateData.kind = data.kind;
      if (data.isDynamic !== undefined) updateData.isDynamic = data.isDynamic;
      if (data.config !== undefined) updateData.config = data.config;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      await db
        .update(simulations)
        .set(updateData)
        .where(eq(simulations.id, id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "simulations",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });
      return { success: true };
    }),

  adminDeleteSimulation: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getLabsDb().delete(simulations).where(eq(simulations.id, input.id));
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "simulations",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Analytics
  // ═══════════════════════════════════════════════════════════

  adminGetAnalytics: adminQuery
    .input(z.object({ labWorkId: z.number().positive() }))
    .query(async ({ input }) => {
      const labsDb = getLabsDb();
      const learningDb = getLearningDb();

      const rows = await labsDb
        .select()
        .from(labAnalytics)
        .where(eq(labAnalytics.labWorkId, input.labWorkId))
        .limit(1);

      // Compute dynamic stats from lab_progress
      const progressStats = await learningDb
        .select({
          total: count(),
          completed: count(),
        })
        .from(labProgress)
        .where(eq(labProgress.labWorkId, input.labWorkId));

      return {
        analytics: rows[0] ?? null,
        progressStats: progressStats[0] ?? { total: 0, completed: 0 },
      };
    }),
});
