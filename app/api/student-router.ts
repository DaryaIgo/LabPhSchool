/**
 * Student Router — Student-facing and Admin-facing endpoints
 *
 * Student endpoints require studentQuery (active student account).
 * Admin endpoints require adminQuery (admin role).
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, studentQuery, adminQuery } from "./middleware";
import {
  findLocalUserById,
  listLocalUsers,
  createLocalUser,
  updateLocalUser,
  deleteLocalUser,
  suspendLocalUser,
  activateLocalUser,
} from "./queries/localUsers";
import { hashPassword, validatePasswordStrength } from "./lib/password";
import {
  getEnrollmentsByLocalUser,
} from "./queries/enrollments";
import { createAuditEntry } from "./queries/audit";
import { getDb } from "./queries/connection";
import { eq } from "drizzle-orm";
import * as schema from "@db/schema";

// ─── Student Endpoints ───

export const studentRouter = createRouter({
  // ── Get current student profile ──
  me: studentQuery.query(async ({ ctx }) => {
    const user = await findLocalUserById(ctx.localUser!.id);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
    }
    return {
      id: user.id,
      login: user.login,
      name: user.name,
      status: user.status,
      role: ctx.role?.name ?? "student",
    };
  }),

  // ── Get student enrollments ──
  getEnrollments: studentQuery.query(async ({ ctx }) => {
    return getEnrollmentsByLocalUser(ctx.localUser!.id);
  }),

  // ─── Admin Endpoints ───

  // ── List all students (paginated) ──
  list: adminQuery
    .input(
      z
        .object({
          status: z.enum(["active", "inactive", "suspended"]).optional(),
          search: z.string().max(100).optional(),
          page: z.number().positive().default(1),
          pageSize: z.number().positive().max(100).default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "list",
        resource: "users",
        details: { filter: input },
      });

      return listLocalUsers(input ?? {});
    }),

  // ── Create student (admin only) ──
  create: adminQuery
    .input(
      z.object({
        login: z
          .string()
          .min(3)
          .max(100)
          .regex(/^[a-zA-Z0-9_]+$/, "Login must be alphanumeric with underscores"),
        password: z.string().min(8).max(128),
        name: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate password strength
      const strength = validatePasswordStrength(input.password);
      if (!strength.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: strength.message,
        });
      }

      // Check if login already exists
      const db = getDb();
      const [found] = await db
        .select({ id: schema.localUsers.id })
        .from(schema.localUsers)
        .where(eq(schema.localUsers.login, input.login))
        .limit(1);

      if (found) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Login already taken",
        });
      }

      // Hash password with bcrypt
      const passwordHash = await hashPassword(input.password);

      // Create student
      const result = await createLocalUser({
        login: input.login,
        passwordHash,
        name: input.name,
        createdBy: ctx.localUser!.id,
      });

      const insertedId = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "users",
        resourceId: insertedId,
        details: { login: input.login, name: input.name },
      });

      return { success: true, id: insertedId };
    }),

  // ── Update student ──
  update: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        name: z.string().min(1).max(255).optional(),
        status: z.enum(["active", "inactive", "suspended"]).optional(),
        password: z.string().min(8).max(128).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const updateData: Parameters<typeof updateLocalUser>[1] = {};
      if (data.name) updateData.name = data.name;
      if (data.status) updateData.status = data.status;
      if (data.password) {
        const strength = validatePasswordStrength(data.password);
        if (!strength.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: strength.message,
          });
        }
        updateData.passwordHash = await hashPassword(data.password);
      }

      await updateLocalUser(id, updateData);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "users",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  // ── Delete student ──
  delete: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await deleteLocalUser(input.id);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "users",
        resourceId: input.id,
      });

      return { success: true };
    }),

  // ── Suspend student ──
  suspend: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await suspendLocalUser(input.id);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "suspend",
        resource: "users",
        resourceId: input.id,
      });

      return { success: true };
    }),

  // ── Activate student ──
  activate: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await activateLocalUser(input.id);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "activate",
        resource: "users",
        resourceId: input.id,
      });

      return { success: true };
    }),

});
