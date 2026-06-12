/**
 * Timeline Router — "Стрела времени"
 *
 * Public: list entries for the interactive timeline.
 * Admin: create, update, delete entries.
 */

import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { timelineEntries } from "@db/schema";
import { eq, asc } from "drizzle-orm";
import { createAuditEntry } from "./queries/audit";

export const timelineRouter = createRouter({
  // ═══════════════════════════════════════════════════════════
  // Public endpoints
  // ═══════════════════════════════════════════════════════════

  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(timelineEntries)
      .orderBy(asc(timelineEntries.sortOrder), asc(timelineEntries.yearStart));
  }),

  // ═══════════════════════════════════════════════════════════
  // Admin CRUD
  // ═══════════════════════════════════════════════════════════

  create: adminQuery
    .input(
      z.object({
        type: z.enum(["physicist", "discovery"]),
        name: z.string().min(1).max(255),
        yearStart: z.number().int().min(1500).max(2100),
        yearEnd: z.number().int().min(1500).max(2100).optional(),
        description: z.string().min(1).max(10000),
        portraitUrl: z.string().max(500).optional(),
        color: z.string().max(20).default("#01acff"),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(timelineEntries).values({
        type: input.type,
        name: input.name,
        yearStart: input.yearStart,
        yearEnd: input.yearEnd ?? null,
        description: input.description,
        portraitUrl: input.portraitUrl ?? null,
        color: input.color,
        sortOrder: input.sortOrder,
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "timeline_entries",
        resourceId: id,
        details: { name: input.name, type: input.type, yearStart: input.yearStart },
      });

      return { id, success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        type: z.enum(["physicist", "discovery"]).optional(),
        name: z.string().min(1).max(255).optional(),
        yearStart: z.number().int().min(1500).max(2100).optional(),
        yearEnd: z.number().int().min(1500).max(2100).optional().nullable(),
        description: z.string().min(1).max(10000).optional(),
        portraitUrl: z.string().max(500).optional().nullable(),
        color: z.string().max(20).optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.type !== undefined) updateData.type = data.type;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.yearStart !== undefined) updateData.yearStart = data.yearStart;
      if (data.yearEnd !== undefined) updateData.yearEnd = data.yearEnd;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.portraitUrl !== undefined) updateData.portraitUrl = data.portraitUrl;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

      await db.update(timelineEntries).set(updateData).where(eq(timelineEntries.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "timeline_entries",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getDb().delete(timelineEntries).where(eq(timelineEntries.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "timeline_entries",
        resourceId: input.id,
      });

      return { success: true };
    }),
});
