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
  getEnrollmentsWithDetails,
} from "./queries/enrollments";
import { createAuditEntry } from "./queries/audit";
import { getDb } from "./queries/connection";
import { eq, and, desc, sql, inArray, count } from "drizzle-orm";
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
      avatar: user.avatar,
      role: ctx.role?.name ?? "student",
    };
  }),

  // ── Update student avatar ──
  updateAvatar: studentQuery
    .input(
      z.object({
        avatar: z
          .string()
          .regex(/^avatar-[1-5]$/, "Invalid avatar"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateLocalUser(ctx.localUser!.id, { avatar: input.avatar });
      return { success: true, avatar: input.avatar };
    }),

  // ── Get student enrollments ──
  getEnrollments: studentQuery.query(async ({ ctx }) => {
    return getEnrollmentsByLocalUser(ctx.localUser!.id);
  }),

  // ── Get full student profile with stats ──
  getProfile: studentQuery.query(async ({ ctx }) => {
    const db = getDb();
    const studentId = ctx.localUser!.id;

    const user = await findLocalUserById(studentId);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
    }

    // Get enrollments with topics
    const enrollments = await getEnrollmentsWithDetails(studentId);

    // Get student progress for all enrolled topics' subtopics
    const enrolledTopicIds = enrollments.map((e) => e.topicId);

    let progress: schema.StudentProgress[] = [];
    let enrolledSubtopics: { id: number; topicId: number }[] = [];
    if (enrolledTopicIds.length > 0) {
      // Get subtopics for enrolled topics
      enrolledSubtopics = await db
        .select({ id: schema.subtopics.id, topicId: schema.subtopics.topicId })
        .from(schema.subtopics)
        .where(inArray(schema.subtopics.topicId, enrolledTopicIds));

      const subtopicIds = enrolledSubtopics.map((s) => s.id);

      if (subtopicIds.length > 0) {
        progress = await db
          .select()
          .from(schema.studentProgress)
          .where(
            and(
              eq(schema.studentProgress.localUserId, studentId),
              inArray(schema.studentProgress.subtopicId, subtopicIds)
            )
          );
      }
    }

    // Calculate stats
    const totalSubtopics = progress.length;
    const completedSubtopics = progress.filter(
      (p) => p.status === "completed"
    ).length;
    const inProgressSubtopics = progress.filter(
      (p) => p.status === "in_progress"
    ).length;
    const notStartedSubtopics = progress.filter(
      (p) => p.status === "not_started"
    ).length;

    const overallProgress =
      totalSubtopics > 0
        ? Math.round((completedSubtopics / totalSubtopics) * 100)
        : 0;

    // Section (topic) progress
    const topicProgress = enrollments.map((e) => {
      const topicSubtopicIds = new Set(
        enrolledSubtopics.filter((s) => s.topicId === e.topicId).map((s) => s.id)
      );
      const topicSubtopics = progress.filter((p) => topicSubtopicIds.has(p.subtopicId));
      const topicCompleted = topicSubtopics.filter(
        (p) => p.status === "completed"
      ).length;
      const topicTotal = topicSubtopics.length;
      return {
        topicId: e.topicId,
        topicTitle: e.topicTitle,
        topicColor: e.topicColor,
        total: topicTotal,
        completed: topicCompleted,
        progress: topicTotal > 0 ? Math.round((topicCompleted / topicTotal) * 100) : 0,
      };
    });

    return {
      id: user.id,
      login: user.login,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      overallProgress,
      totalSubtopics,
      completedSubtopics,
      inProgressSubtopics,
      notStartedSubtopics,
      enrollments,
      topicProgress,
    };
  }),

  // ── Get learning path (roadmap) ──
  getLearningPath: studentQuery.query(async ({ ctx }) => {
    const db = getDb();
    const studentId = ctx.localUser!.id;

    const enrollments = await getEnrollmentsWithDetails(studentId);
    const enrolledTopicIds = enrollments.map((e) => e.topicId);

    if (enrolledTopicIds.length === 0) {
      return { topics: [] };
    }

    // Get all subtopics for enrolled topics
    const subtopics = await db
      .select({
        id: schema.subtopics.id,
        topicId: schema.subtopics.topicId,
        title: schema.subtopics.title,
        order: schema.subtopics.order,
        jupyterUrl: schema.subtopics.jupyterUrl,
      })
      .from(schema.subtopics)
      .where(inArray(schema.subtopics.topicId, enrolledTopicIds))
      .orderBy(schema.subtopics.topicId, schema.subtopics.order);

    const subtopicIds = subtopics.map((s) => s.id);

    // Get progress for these subtopics
    const progress =
      subtopicIds.length > 0
        ? await db
            .select()
            .from(schema.studentProgress)
            .where(
              and(
                eq(schema.studentProgress.localUserId, studentId),
                inArray(schema.studentProgress.subtopicId, subtopicIds)
              )
            )
        : [];

    // Get legacy labs for these topics
    const topicLabs = enrolledTopicIds.length > 0
      ? await db
          .select()
          .from(schema.labs)
          .where(inArray(schema.labs.topicId, enrolledTopicIds))
      : [];

    // Get lab progress for virtual labs
    const labProgress = await db
      .select({
        labWorkId: schema.labProgress.labWorkId,
        status: schema.labProgress.status,
        completedAt: schema.labProgress.completedAt,
      })
      .from(schema.labProgress)
      .where(eq(schema.labProgress.localUserId, studentId));

    // Group by topic
    const topicsWithSubtopics = enrollments.map((enrollment) => {
      const topicSubs = subtopics.filter(
        (s) => s.topicId === enrollment.topicId
      );
      const subsWithProgress = topicSubs.map((sub) => {
        const prog = progress.find((p) => p.subtopicId === sub.id);
        const isCurrent = enrollment.currentSubtopicId === sub.id;
        let status = (prog?.status ?? "not_started") as
          | "not_started"
          | "in_progress"
          | "completed";
        // If this is the current subtopic assigned by teacher,
        // it should be considered in_progress, not not_started
        if (isCurrent && status === "not_started") {
          status = "in_progress";
        }
        return {
          id: sub.id,
          title: sub.title,
          order: sub.order,
          jupyterUrl: sub.jupyterUrl,
          status,
          startedAt: prog?.startedAt,
          completedAt: prog?.completedAt,
          comment: prog?.comment,
          theoryCompleted: prog?.theoryCompleted === "completed",
          practiceCompleted: prog?.practiceCompleted === "completed",
          labCompleted: prog?.labCompleted === "completed",
          isCurrent,
        };
      });

      return {
        enrollmentId: enrollment.id,
        topicId: enrollment.topicId,
        topicTitle: enrollment.topicTitle,
        topicColor: enrollment.topicColor,
        enrollmentStatus: enrollment.status,
        startedAt: enrollment.startedAt,
        completedAt: enrollment.completedAt,
        comment: enrollment.comment,
        currentSubtopicId: enrollment.currentSubtopicId,
        subtopics: subsWithProgress,
        labs: topicLabs.filter((l) => l.topicId === enrollment.topicId),
      };
    });

    return { topics: topicsWithSubtopics, labProgress };
  }),

  // ── Get current active topic ──
  getCurrentTopic: studentQuery.query(async ({ ctx }) => {
    const db = getDb();
    const studentId = ctx.localUser!.id;

    // Find enrollment with currentSubtopicId
    const enrollment = await db
      .select({
        id: schema.enrollments.id,
        topicId: schema.enrollments.topicId,
        currentSubtopicId: schema.enrollments.currentSubtopicId,
        status: schema.enrollments.status,
        comment: schema.enrollments.comment,
      })
      .from(schema.enrollments)
      .where(
        and(
          eq(schema.enrollments.localUserId, studentId),
          eq(schema.enrollments.status, "active"),
          sql`${schema.enrollments.currentSubtopicId} IS NOT NULL`
        )
      )
      .limit(1);

    if (!enrollment.length) {
      // Fallback: find first in_progress subtopic
      const inProgress = await db
        .select({
          subtopicId: schema.studentProgress.subtopicId,
          topicId: schema.subtopics.topicId,
        })
        .from(schema.studentProgress)
        .innerJoin(
          schema.subtopics,
          eq(schema.studentProgress.subtopicId, schema.subtopics.id)
        )
        .where(
          and(
            eq(schema.studentProgress.localUserId, studentId),
            eq(schema.studentProgress.status, "in_progress")
          )
        )
        .limit(1);

      if (!inProgress.length) {
        return null;
      }

      const subtopic = await db
        .select()
        .from(schema.subtopics)
        .where(eq(schema.subtopics.id, inProgress[0].subtopicId))
        .limit(1);

      const topic = await db
        .select()
        .from(schema.topics)
        .where(eq(schema.topics.id, inProgress[0].topicId))
        .limit(1);

      const labs = await db
        .select()
        .from(schema.labs)
        .where(eq(schema.labs.topicId, inProgress[0].topicId));

      const problemTypes = await db
        .select()
        .from(schema.problemTypes)
        .where(eq(schema.problemTypes.subtopicId, inProgress[0].subtopicId));

      return {
        subtopic: subtopic[0] ?? null,
        topic: topic[0] ?? null,
        labs,
        problemTypes,
        enrollmentComment: null,
      };
    }

    const e = enrollment[0];
    const subtopic = await db
      .select()
      .from(schema.subtopics)
      .where(eq(schema.subtopics.id, e.currentSubtopicId!))
      .limit(1);

    const topic = await db
      .select()
      .from(schema.topics)
      .where(eq(schema.topics.id, e.topicId))
      .limit(1);

    const labs = await db
      .select()
      .from(schema.labs)
      .where(eq(schema.labs.topicId, e.topicId));

    const problemTypes = await db
      .select()
      .from(schema.problemTypes)
      .where(eq(schema.problemTypes.subtopicId, e.currentSubtopicId!));

    return {
      subtopic: subtopic[0] ?? null,
      topic: topic[0] ?? null,
      labs,
      problemTypes,
      enrollmentComment: e.comment,
    };
  }),

  // ── Get recent activity ──
  getActivity: studentQuery.query(async ({ ctx }) => {
    const db = getDb();
    const studentId = ctx.localUser!.id;

    // Last opened topic (latest enrollment)
    const lastEnrollment = await db
      .select({
        id: schema.enrollments.id,
        topicId: schema.enrollments.topicId,
        enrolledAt: schema.enrollments.enrolledAt,
        status: schema.enrollments.status,
      })
      .from(schema.enrollments)
      .where(eq(schema.enrollments.localUserId, studentId))
      .orderBy(desc(schema.enrollments.enrolledAt))
      .limit(1);

    // Last completed topic
    const lastCompleted = await db
      .select({
        id: schema.enrollments.id,
        topicId: schema.enrollments.topicId,
        completedAt: schema.enrollments.completedAt,
      })
      .from(schema.enrollments)
      .where(
        and(
          eq(schema.enrollments.localUserId, studentId),
          eq(schema.enrollments.status, "completed")
        )
      )
      .orderBy(desc(schema.enrollments.completedAt))
      .limit(1);

    // Last completed subtopic
    const lastCompletedSubtopic = await db
      .select({
        subtopicId: schema.studentProgress.subtopicId,
        completedAt: schema.studentProgress.completedAt,
      })
      .from(schema.studentProgress)
      .where(
        and(
          eq(schema.studentProgress.localUserId, studentId),
          eq(schema.studentProgress.status, "completed")
        )
      )
      .orderBy(desc(schema.studentProgress.completedAt))
      .limit(1);

    // Last completed lab
    const lastCompletedLab = await db
      .select({
        labWorkId: schema.labProgress.labWorkId,
        completedAt: schema.labProgress.completedAt,
      })
      .from(schema.labProgress)
      .where(
        and(
          eq(schema.labProgress.localUserId, studentId),
          eq(schema.labProgress.status, "completed")
        )
      )
      .orderBy(desc(schema.labProgress.completedAt))
      .limit(1);

    // Last login
    const user = await findLocalUserById(studentId);

    return {
      lastEnrollment: lastEnrollment[0] ?? null,
      lastCompletedTopic: lastCompleted[0] ?? null,
      lastCompletedSubtopic: lastCompletedSubtopic[0] ?? null,
      lastCompletedLab: lastCompletedLab[0] ?? null,
      lastLoginAt: user?.lastLoginAt ?? null,
    };
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
      const strength = validatePasswordStrength(input.password);
      if (!strength.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: strength.message,
        });
      }

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

      const passwordHash = await hashPassword(input.password);
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

  // ── Admin: Update student progress on a subtopic ──
  updateProgress: adminQuery
    .input(
      z.object({
        studentId: z.number().positive(),
        subtopicId: z.number().positive(),
        status: z.enum(["not_started", "in_progress", "completed"]).optional(),
        theoryCompleted: z.boolean().optional(),
        practiceCompleted: z.boolean().optional(),
        labCompleted: z.boolean().optional(),
        comment: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { studentId, subtopicId, ...data } = input;

      // Check if student exists
      const student = await findLocalUserById(studentId);
      if (!student) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }

      // Check if subtopic exists
      const [subtopic] = await db
        .select()
        .from(schema.subtopics)
        .where(eq(schema.subtopics.id, subtopicId))
        .limit(1);
      if (!subtopic) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subtopic not found" });
      }

      // Find existing progress
      const [existing] = await db
        .select()
        .from(schema.studentProgress)
        .where(
          and(
            eq(schema.studentProgress.localUserId, studentId),
            eq(schema.studentProgress.subtopicId, subtopicId)
          )
        )
        .limit(1);

      const updateData: Partial<schema.StudentProgress> = {};
      if (data.status) {
        updateData.status = data.status;
        if (data.status === "in_progress" && !existing?.startedAt) {
          updateData.startedAt = new Date();
        }
        if (data.status === "completed") {
          updateData.completedAt = new Date();
        }
      }
      if (data.theoryCompleted !== undefined) {
        updateData.theoryCompleted = data.theoryCompleted ? "completed" : "pending";
      }
      if (data.practiceCompleted !== undefined) {
        updateData.practiceCompleted = data.practiceCompleted ? "completed" : "pending";
      }
      if (data.labCompleted !== undefined) {
        updateData.labCompleted = data.labCompleted ? "completed" : "pending";
      }
      if (data.comment !== undefined) {
        updateData.comment = data.comment;
      }

      if (existing) {
        await db
          .update(schema.studentProgress)
          .set(updateData)
          .where(eq(schema.studentProgress.id, existing.id));
      } else {
        await db.insert(schema.studentProgress).values({
          localUserId: studentId,
          subtopicId,
          status: data.status ?? "not_started",
          theoryCompleted: data.theoryCompleted ? "completed" : "pending",
          practiceCompleted: data.practiceCompleted ? "completed" : "pending",
          labCompleted: data.labCompleted ? "completed" : "pending",
          comment: data.comment,
          startedAt: data.status === "in_progress" ? new Date() : undefined,
          completedAt: data.status === "completed" ? new Date() : undefined,
        });
      }

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "student_progress",
        details: { studentId, subtopicId, ...data },
      });

      return { success: true };
    }),

  // ── Admin: Get student progress for a topic ──
  getTopicProgress: adminQuery
    .input(
      z.object({
        studentId: z.number().positive(),
        topicId: z.number().positive(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const subtopics = await db
        .select()
        .from(schema.subtopics)
        .where(eq(schema.subtopics.topicId, input.topicId))
        .orderBy(schema.subtopics.order);

      const subtopicIds = subtopics.map((s) => s.id);

      const progress =
        subtopicIds.length > 0
          ? await db
              .select()
              .from(schema.studentProgress)
              .where(
                and(
                  eq(schema.studentProgress.localUserId, input.studentId),
                  inArray(schema.studentProgress.subtopicId, subtopicIds)
                )
              )
          : [];

      return subtopics.map((sub) => {
        const prog = progress.find((p) => p.subtopicId === sub.id);
        return {
          subtopicId: sub.id,
          title: sub.title,
          status: (prog?.status ?? "not_started") as
            | "not_started"
            | "in_progress"
            | "completed",
          theoryCompleted: prog?.theoryCompleted === "completed",
          practiceCompleted: prog?.practiceCompleted === "completed",
          labCompleted: prog?.labCompleted === "completed",
          comment: prog?.comment,
          startedAt: prog?.startedAt,
          completedAt: prog?.completedAt,
        };
      });
    }),

  // ═══════════════════════════════════════════════════════════
  // Student Jupyter Notebooks
  // ═══════════════════════════════════════════════════════════

  getMyJupyterNotebooks: studentQuery.query(async ({ ctx }) => {
    const db = getDb();
    const studentId = ctx.localUser!.id;

    const accesses = await db
      .select({
        notebookId: schema.jupyterNotebookAccess.notebookId,
        grantedAt: schema.jupyterNotebookAccess.grantedAt,
      })
      .from(schema.jupyterNotebookAccess)
      .where(eq(schema.jupyterNotebookAccess.localUserId, studentId));

    const notebookIds = accesses.map((a) => a.notebookId);
    if (notebookIds.length === 0) return [];

    const notebooks = await db
      .select()
      .from(schema.jupyterNotebooks)
      .where(inArray(schema.jupyterNotebooks.id, notebookIds));

    const subtopicList = await db
      .select()
      .from(schema.subtopics)
      .where(inArray(schema.subtopics.id, notebooks.map((n) => n.subtopicId)));
    const subtopicMap = new Map(subtopicList.map((s) => [s.id, s.title]));

    return notebooks.map((n) => ({
      ...n,
      subtopicTitle: subtopicMap.get(n.subtopicId) ?? "—",
    }));
  }),

  // ═══════════════════════════════════════════════════════════
  // Student Notifications
  // ═══════════════════════════════════════════════════════════

  getNotifications: studentQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.localUserId, ctx.localUser!.id))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(50);
  }),

  getUnreadNotificationCount: studentQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db
      .select({ count: count() })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.localUserId, ctx.localUser!.id),
          eq(schema.notifications.read, false)
        )
      );
    return result[0]?.count ?? 0;
  }),

  markNotificationRead: studentQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(schema.notifications)
        .set({ read: true })
        .where(
          and(
            eq(schema.notifications.id, input.id),
            eq(schema.notifications.localUserId, ctx.localUser!.id)
          )
        );
      return { success: true };
    }),

  markAllNotificationsRead: studentQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(schema.notifications)
      .set({ read: true })
      .where(eq(schema.notifications.localUserId, ctx.localUser!.id));
    return { success: true };
  }),
});
