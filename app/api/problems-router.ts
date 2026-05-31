import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { problems, problemTypes } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

export const problemsRouter = createRouter({
  listTypes: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(problemTypes).orderBy(asc(problemTypes.order));
  }),

  listByType: adminQuery
    .input(z.object({ typeId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(problems)
        .where(eq(problems.problemTypeId, input.typeId))
        .orderBy(asc(problems.order));
    }),

  listByLevel: adminQuery
    .input(
      z.object({
        typeId: z.number(),
        level: z.enum(["basic", "intermediate", "advanced"]),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(problems)
        .where(
          and(
            eq(problems.problemTypeId, input.typeId),
            eq(problems.level, input.level)
          )
        )
        .orderBy(asc(problems.order));
    }),

  getById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(problems)
        .where(eq(problems.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  createProblem: adminQuery
    .input(
      z.object({
        problemTypeId: z.number(),
        order: z.number(),
        level: z.enum(["basic", "intermediate", "advanced"]),
        source: z.string().optional(),
        condition: z.string(),
        given: z.string().optional(),
        find: z.string().optional(),
        solution: z.string(),
        answer: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(problems).values([
        {
          problemTypeId: input.problemTypeId,
          order: input.order,
          level: input.level,
          source: input.source ?? null,
          condition: input.condition,
          given: input.given ?? null,
          find: input.find ?? null,
          solution: input.solution,
          answer: input.answer,
        },
      ]);
      return { id: Number(result[0].insertId) };
    }),

  createType: adminQuery
    .input(
      z.object({
        subtopicId: z.number(),
        order: z.number(),
        title: z.string(),
        slug: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(problemTypes).values([
        {
          subtopicId: input.subtopicId,
          order: input.order,
          title: input.title,
          slug: input.slug,
          description: input.description ?? null,
        },
      ]);
      return { id: Number(result[0].insertId) };
    }),
});
