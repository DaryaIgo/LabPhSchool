/**
 * Problem Management Router
 *
 * Admin-only CRUD for the problem bank.
 * Problems are never public; they are assigned to students by admins.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getProblemsDb } from "./queries/connection";
import {
  problemCategories,
  problemSubcategories,
  problems,
} from "@db/schema/problems";
import { eq, asc } from "drizzle-orm";
import { createAuditEntry } from "./queries/audit";

export const problemManagementRouter = createRouter({
  // ═══════════════════════════════════════════════════════════
  // ADMIN: Categories CRUD
  // ═══════════════════════════════════════════════════════════

  adminListCategories: adminQuery.query(async () => {
    return getProblemsDb()
      .select()
      .from(problemCategories)
      .orderBy(asc(problemCategories.order));
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
        description: z.string().max(5000).optional(),
        color: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getProblemsDb();
      const result = await db.insert(problemCategories).values({
        order: input.order,
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        color: input.color ?? "#ffcb3d",
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "create",
        resource: "problem_categories",
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
        description: z.string().max(5000).optional(),
        color: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getProblemsDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.color !== undefined) updateData.color = data.color;

      await db
        .update(problemCategories)
        .set(updateData)
        .where(eq(problemCategories.id, id));
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "update",
        resource: "problem_categories",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });
      return { success: true };
    }),

  adminDeleteCategory: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getProblemsDb()
        .delete(problemCategories)
        .where(eq(problemCategories.id, input.id));
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "delete",
        resource: "problem_categories",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Subcategories CRUD
  // ═══════════════════════════════════════════════════════════

  adminListSubcategories: adminQuery
    .input(z.object({ categoryId: z.number().positive() }).optional())
    .query(async ({ input }) => {
      const db = getProblemsDb();
      if (input?.categoryId) {
        return db
          .select()
          .from(problemSubcategories)
          .where(eq(problemSubcategories.categoryId, input.categoryId))
          .orderBy(asc(problemSubcategories.order));
      }
      return db
        .select()
        .from(problemSubcategories)
        .orderBy(asc(problemSubcategories.order));
    }),

  adminCreateSubcategory: adminQuery
    .input(
      z.object({
        categoryId: z.number().positive(),
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[a-z0-9-]+$/),
        description: z.string().max(5000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getProblemsDb();
      const result = await db.insert(problemSubcategories).values({
        categoryId: input.categoryId,
        order: input.order,
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "create",
        resource: "problem_subcategories",
        resourceId: id,
        details: { title: input.title, slug: input.slug },
      });
      return { id, success: true };
    }),

  adminUpdateSubcategory: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        categoryId: z.number().positive().optional(),
        order: z.number().int().min(1).optional(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getProblemsDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.categoryId !== undefined)
        updateData.categoryId = data.categoryId;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;

      await db
        .update(problemSubcategories)
        .set(updateData)
        .where(eq(problemSubcategories.id, id));
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "update",
        resource: "problem_subcategories",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });
      return { success: true };
    }),

  adminDeleteSubcategory: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getProblemsDb()
        .delete(problemSubcategories)
        .where(eq(problemSubcategories.id, input.id));
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "delete",
        resource: "problem_subcategories",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Problems CRUD
  // ═══════════════════════════════════════════════════════════

  adminListProblems: adminQuery.query(async () => {
    const db = getProblemsDb();
    return db
      .select({
        id: problems.id,
        categoryId: problems.categoryId,
        subcategoryId: problems.subcategoryId,
        order: problems.order,
        title: problems.title,
        slug: problems.slug,
        difficulty: problems.difficulty,
        source: problems.source,
        condition: problems.condition,
        solution: problems.solution,
        answer: problems.answer,
        status: problems.status,
        createdAt: problems.createdAt,
        updatedAt: problems.updatedAt,
        categoryTitle: problemCategories.title,
        subcategoryTitle: problemSubcategories.title,
      })
      .from(problems)
      .leftJoin(
        problemCategories,
        eq(problems.categoryId, problemCategories.id)
      )
      .leftJoin(
        problemSubcategories,
        eq(problems.subcategoryId, problemSubcategories.id)
      )
      .orderBy(asc(problems.order));
  }),

  adminGetProblem: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      const db = getProblemsDb();
      const rows = await db
        .select({
          id: problems.id,
          categoryId: problems.categoryId,
          subcategoryId: problems.subcategoryId,
          order: problems.order,
          title: problems.title,
          slug: problems.slug,
          difficulty: problems.difficulty,
          source: problems.source,
          condition: problems.condition,
          solution: problems.solution,
          answer: problems.answer,
          status: problems.status,
          createdAt: problems.createdAt,
          updatedAt: problems.updatedAt,
          categoryTitle: problemCategories.title,
          subcategoryTitle: problemSubcategories.title,
        })
        .from(problems)
        .leftJoin(
          problemCategories,
          eq(problems.categoryId, problemCategories.id)
        )
        .leftJoin(
          problemSubcategories,
          eq(problems.subcategoryId, problemSubcategories.id)
        )
        .where(eq(problems.id, input.id))
        .limit(1);
      return rows[0] ?? null;
    }),

  adminCreateProblem: adminQuery
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
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        source: z.string().max(255).optional(),
        condition: z.string().min(1).max(50000),
        solution: z.string().min(1).max(50000),
        answer: z.string().min(1).max(5000),
        status: z.enum(["draft", "published"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getProblemsDb();
      const result = await db.insert(problems).values({
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId ?? null,
        order: input.order,
        title: input.title,
        slug: input.slug,
        difficulty: input.difficulty ?? "medium",
        source: input.source ?? null,
        condition: input.condition,
        solution: input.solution,
        answer: input.answer,
        status: input.status ?? "draft",
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "create",
        resource: "problems",
        resourceId: id,
        details: { title: input.title, slug: input.slug },
      });
      return { id, success: true };
    }),

  adminUpdateProblem: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        categoryId: z.number().positive().optional(),
        subcategoryId: z.number().positive().optional().nullable(),
        order: z.number().int().min(1).optional(),
        title: z.string().min(1).max(255).optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        source: z.string().max(255).optional(),
        condition: z.string().max(50000).optional(),
        solution: z.string().max(50000).optional(),
        answer: z.string().max(5000).optional(),
        status: z.enum(["draft", "published"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getProblemsDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.categoryId !== undefined)
        updateData.categoryId = data.categoryId;
      if (data.subcategoryId !== undefined)
        updateData.subcategoryId = data.subcategoryId;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.difficulty !== undefined)
        updateData.difficulty = data.difficulty;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.condition !== undefined) updateData.condition = data.condition;
      if (data.solution !== undefined) updateData.solution = data.solution;
      if (data.answer !== undefined) updateData.answer = data.answer;
      if (data.status !== undefined) updateData.status = data.status;

      await db.update(problems).set(updateData).where(eq(problems.id, id));
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "update",
        resource: "problems",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });
      return { success: true };
    }),

  adminDeleteProblem: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getProblemsDb().delete(problems).where(eq(problems.id, input.id));
      await createAuditEntry({
        actorId: ctx.adminUser!.id,
        actorType: "admin_user",
        action: "delete",
        resource: "problems",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // ADMIN: Flat list for assignment picker
  // ═══════════════════════════════════════════════════════════

  adminListProblemsForAssignment: adminQuery.query(async () => {
    const db = getProblemsDb();
    return db
      .select({
        id: problems.id,
        title: problems.title,
        slug: problems.slug,
        difficulty: problems.difficulty,
        categoryTitle: problemCategories.title,
        subcategoryTitle: problemSubcategories.title,
      })
      .from(problems)
      .leftJoin(
        problemCategories,
        eq(problems.categoryId, problemCategories.id)
      )
      .leftJoin(
        problemSubcategories,
        eq(problems.subcategoryId, problemSubcategories.id)
      )
      .orderBy(asc(problemCategories.order), asc(problems.order));
  }),
});
