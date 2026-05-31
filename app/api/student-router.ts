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
  getLocalUserProgress,
  upsertLocalUserProgress,
} from "./queries/localUsers";
import { hashPassword, validatePasswordStrength } from "./lib/password";
import {
  getEnrollmentsByLocalUser,
  getActiveEnrollmentsByLocalUser,
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

  // ── Get student progress with enrollment filtering ──
  getProgress: studentQuery.query(async ({ ctx }) => {
    const localUserId = ctx.localUser!.id;

    // Get active enrollments to filter accessible topics
    const activeEnrollments = await getActiveEnrollmentsByLocalUser(localUserId);
    const enrolledTopicIds = new Set(activeEnrollments.map((e) => e.topicId));

    // Get all subtopics grouped by topic
    const allSubtopics = await getDb()
      .select({
        subtopicId: schema.subtopics.id,
        subtopicTitle: schema.subtopics.title,
        topicId: schema.topics.id,
        topicTitle: schema.topics.title,
        topicSlug: schema.topics.slug,
        topicColor: schema.topics.color,
      })
      .from(schema.subtopics)
      .innerJoin(schema.topics, eq(schema.subtopics.topicId, schema.topics.id))
      .orderBy(schema.topics.order, schema.subtopics.order);

    // Get progress entries
    const progress = await getLocalUserProgress(localUserId);

    // Group by topic, filtering to enrolled topics only
    const topicMap = new Map<
      number,
      {
        topicId: number;
        topicTitle: string;
        topicSlug: string;
        topicColor: string;
        enrolled: boolean;
        subtopics: {
          subtopicId: number;
          subtopicTitle: string;
          theory: string;
          practice: string;
          lab: string;
        }[];
      }
    >();

    for (const s of allSubtopics) {
      if (!topicMap.has(s.topicId)) {
        topicMap.set(s.topicId, {
          topicId: s.topicId,
          topicTitle: s.topicTitle,
          topicSlug: s.topicSlug,
          topicColor: s.topicColor ?? "#2eff8c",
          enrolled: enrolledTopicIds.has(s.topicId),
          subtopics: [],
        });
      }

      const progressEntry = progress.find(
        (p) => p.subtopicId === s.subtopicId
      );

      topicMap.get(s.topicId)!.subtopics.push({
        subtopicId: s.subtopicId,
        subtopicTitle: s.subtopicTitle,
        theory: progressEntry?.theoryCompleted ?? "pending",
        practice: progressEntry?.practiceCompleted ?? "pending",
        lab: progressEntry?.labCompleted ?? "pending",
      });
    }

    return Array.from(topicMap.values());
  }),

  // ── Get student enrollments ──
  getEnrollments: studentQuery.query(async ({ ctx }) => {
    return getEnrollmentsByLocalUser(ctx.localUser!.id);
  }),

  // ── Update own progress ──
  updateProgress: studentQuery
    .input(
      z.object({
        subtopicId: z.number().positive(),
        theoryCompleted: z.enum(["pending", "completed"]).optional(),
        practiceCompleted: z.enum(["pending", "completed"]).optional(),
        labCompleted: z.enum(["pending", "completed"]).optional(),
        notes: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertLocalUserProgress(ctx.localUser!.id, input.subtopicId, {
        theoryCompleted: input.theoryCompleted,
        practiceCompleted: input.practiceCompleted,
        labCompleted: input.labCompleted,
        notes: input.notes,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "local_user",
        action: "update",
        resource: "progress",
        details: { subtopicId: input.subtopicId },
      });

      return { success: true };
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

  // ── Get student progress (admin view) ──
  adminGetProgress: adminQuery
    .input(z.object({ studentId: z.number().positive() }))
    .query(async ({ input }) => {
      const student = await findLocalUserById(input.studentId);
      if (!student) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }

      const progress = await getLocalUserProgress(input.studentId);
      const enrollments = await getEnrollmentsByLocalUser(input.studentId);

      const allSubtopics = await getDb()
        .select({
          subtopicId: schema.subtopics.id,
          subtopicTitle: schema.subtopics.title,
          topicId: schema.topics.id,
          topicTitle: schema.topics.title,
          topicSlug: schema.topics.slug,
          topicColor: schema.topics.color,
        })
        .from(schema.subtopics)
        .innerJoin(schema.topics, eq(schema.subtopics.topicId, schema.topics.id))
        .orderBy(schema.topics.order, schema.subtopics.order);

      const topicMap = new Map<
        number,
        {
          topicId: number;
          topicTitle: string;
          topicSlug: string;
          topicColor: string;
          subtopics: {
            subtopicId: number;
            subtopicTitle: string;
            theory: string;
            practice: string;
            lab: string;
          }[];
        }
      >();

      for (const s of allSubtopics) {
        if (!topicMap.has(s.topicId)) {
          topicMap.set(s.topicId, {
            topicId: s.topicId,
            topicTitle: s.topicTitle,
            topicSlug: s.topicSlug,
            topicColor: s.topicColor ?? "#2eff8c",
            subtopics: [],
          });
        }

        const progressEntry = progress.find(
          (p) => p.subtopicId === s.subtopicId
        );

        topicMap.get(s.topicId)!.subtopics.push({
          subtopicId: s.subtopicId,
          subtopicTitle: s.subtopicTitle,
          theory: progressEntry?.theoryCompleted ?? "pending",
          practice: progressEntry?.practiceCompleted ?? "pending",
          lab: progressEntry?.labCompleted ?? "pending",
        });
      }

      return {
        student: {
          id: student.id,
          login: student.login,
          name: student.name,
          status: student.status,
        },
        topics: Array.from(topicMap.values()),
        enrollments,
      };
    }),

  // ── Admin: Update student progress ──
  adminUpdateProgress: adminQuery
    .input(
      z.object({
        studentId: z.number().positive(),
        subtopicId: z.number().positive(),
        theoryCompleted: z.enum(["pending", "completed"]).optional(),
        practiceCompleted: z.enum(["pending", "completed"]).optional(),
        labCompleted: z.enum(["pending", "completed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertLocalUserProgress(input.studentId, input.subtopicId, {
        theoryCompleted: input.theoryCompleted,
        practiceCompleted: input.practiceCompleted,
        labCompleted: input.labCompleted,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "progress",
        details: {
          studentId: input.studentId,
          subtopicId: input.subtopicId,
        },
      });

      return { success: true };
    }),
});
