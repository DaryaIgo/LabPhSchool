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
import { getAssignedLabWorksByStudent } from "./queries/assignedLabWorks";
import {
  getAssignedProblemsByStudent,
  getAssignedProblemById,
  updateAssignedProblem,
} from "./queries/assignedProblems";
import {
  getAssignedJupyterNotebooksByStudent,
  getAssignedJupyterNotebookById,
  updateAssignedJupyterNotebook,
} from "./queries/assignedJupyterNotebooks";
import { createAuditEntry } from "./queries/audit";
import {
  eq,
  and,
  desc,
  sql,
  inArray,
  count,
  isNull,
  isNotNull,
} from "drizzle-orm";

import {
  getAuthDb,
  getContentDb,
  getLearningDb,
  getJupyterDb,
  getNotificationsDb,
} from "./queries/connection";

import { localUsers } from "@db/schema/auth";
import { topicNodes } from "@db/schema/content";
import {
  enrollments,
  studentProgress,
  labProgress,
  type StudentProgress,
} from "@db/schema/learning";
import { jupyterNotebooks, jupyterNotebookAccess } from "@db/schema/jupyter";
import { notifications } from "@db/schema/notifications";

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
        avatar: z.string().regex(/^avatar-[1-5]$/, "Invalid avatar"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateLocalUser(ctx.localUser!.id, { avatar: input.avatar });
      return { success: true, avatar: input.avatar };
    }),

  // ── Get student enrollments ──
  getEnrollments: studentQuery.query(async ({ ctx }) => {
    const contentDb = getContentDb();
    if (ctx.role?.name === "admin") {
      const allTopics = await contentDb
        .select()
        .from(topicNodes)
        .where(isNull(topicNodes.parentId))
        .orderBy(topicNodes.order);
      return allTopics.map(t => ({
        id: 0,
        localUserId: ctx.localUser!.id,
        topicNodeId: t.id,
        status: "active" as const,
        enrolledAt: new Date(),
        expiresAt: null as Date | null,
        topicTitle: t.title,
        topicSlug: t.slug,
        topicColor: t.color,
      }));
    }
    return getEnrollmentsByLocalUser(ctx.localUser!.id);
  }),

  // ── Get full student profile with stats ──
  getProfile: studentQuery.query(async ({ ctx }) => {
    const contentDb = getContentDb();
    const learningDb = getLearningDb();
    const studentId = ctx.localUser!.id;

    const user = await findLocalUserById(studentId);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
    }

    // Get enrollments with topic nodes
    let enrollmentsList;
    if (ctx.role?.name === "admin") {
      const allTopics = await contentDb
        .select()
        .from(topicNodes)
        .where(isNull(topicNodes.parentId))
        .orderBy(topicNodes.order);
      enrollmentsList = allTopics.map(t => ({
        id: 0,
        localUserId: studentId,
        topicNodeId: t.id,
        status: "active" as const,
        startedAt: null as Date | null,
        completedAt: null as Date | null,
        comment: null as string | null,
        currentSubtopicNodeId: null as number | null,
        enrolledAt: new Date(),
        expiresAt: null as Date | null,
        topicTitle: t.title,
        topicSlug: t.slug,
        topicColor: t.color,
      }));
    } else {
      enrollmentsList = await getEnrollmentsWithDetails(studentId);
    }

    // Get all subtopic nodes grouped by their parent topic
    const allSubtopicNodes = await contentDb
      .select({ id: topicNodes.id, parentId: topicNodes.parentId })
      .from(topicNodes)
      .where(isNotNull(topicNodes.parentId));

    const allSubtopicNodeIds = allSubtopicNodes.map(s => s.id);

    const progress: StudentProgress[] =
      allSubtopicNodeIds.length > 0
        ? await learningDb
            .select()
            .from(studentProgress)
            .where(
              and(
                eq(studentProgress.localUserId, studentId),
                inArray(studentProgress.subtopicNodeId, allSubtopicNodeIds)
              )
            )
        : [];

    // Calculate stats
    const totalSubtopics = allSubtopicNodes.length;
    const completedSubtopics = progress.filter(
      p => p.status === "completed"
    ).length;
    const inProgressSubtopics = progress.filter(
      p => p.status === "in_progress"
    ).length;
    const notStartedSubtopics = progress.filter(
      p => p.status === "not_started"
    ).length;

    const overallProgress =
      totalSubtopics > 0
        ? Math.round((completedSubtopics / totalSubtopics) * 100)
        : 0;

    // Section (topic) progress
    const topicProgress = enrollmentsList.map(e => {
      const topicSubtopicIds = new Set(
        allSubtopicNodes
          .filter(s => s.parentId === e.topicNodeId)
          .map(s => s.id)
      );
      const topicSubtopics = progress.filter(p =>
        topicSubtopicIds.has(p.subtopicNodeId)
      );
      const topicCompleted = topicSubtopics.filter(
        p => p.status === "completed"
      ).length;
      const topicTotal = topicSubtopics.length;
      return {
        topicNodeId: e.topicNodeId,
        topicTitle: e.topicTitle,
        topicColor: e.topicColor,
        total: topicTotal,
        completed: topicCompleted,
        progress:
          topicTotal > 0 ? Math.round((topicCompleted / topicTotal) * 100) : 0,
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
      enrollments: enrollmentsList,
      topicProgress,
    };
  }),

  // ── Get learning path (roadmap) ──
  getLearningPath: studentQuery.query(async ({ ctx }) => {
    const contentDb = getContentDb();
    const learningDb = getLearningDb();
    const studentId = ctx.localUser!.id;

    let enrollmentsList;
    if (ctx.role?.name === "admin") {
      const allTopics = await contentDb
        .select()
        .from(topicNodes)
        .where(isNull(topicNodes.parentId))
        .orderBy(topicNodes.order);
      enrollmentsList = allTopics.map(t => ({
        id: 0,
        localUserId: studentId,
        topicNodeId: t.id,
        status: "active" as const,
        startedAt: null as Date | null,
        completedAt: null as Date | null,
        comment: null as string | null,
        currentSubtopicNodeId: null as number | null,
        enrolledAt: new Date(),
        expiresAt: null as Date | null,
        topicTitle: t.title,
        topicSlug: t.slug,
        topicColor: t.color,
      }));
    } else {
      enrollmentsList = await getEnrollmentsWithDetails(studentId);
    }
    const enrolledTopicNodeIds = enrollmentsList.map(e => e.topicNodeId);

    if (enrolledTopicNodeIds.length === 0) {
      return { topics: [] };
    }

    // Get all subtopic nodes for enrolled topics
    const subtopicNodesList = await contentDb
      .select({
        id: topicNodes.id,
        parentId: topicNodes.parentId,
        title: topicNodes.title,
        order: topicNodes.order,
        jupyterUrl: topicNodes.jupyterUrl,
      })
      .from(topicNodes)
      .where(inArray(topicNodes.parentId, enrolledTopicNodeIds))
      .orderBy(topicNodes.parentId, topicNodes.order);

    const subtopicNodeIds = subtopicNodesList.map(s => s.id);

    // Get progress for these subtopic nodes
    const progress =
      subtopicNodeIds.length > 0
        ? await learningDb
            .select()
            .from(studentProgress)
            .where(
              and(
                eq(studentProgress.localUserId, studentId),
                inArray(studentProgress.subtopicNodeId, subtopicNodeIds)
              )
            )
        : [];

    // Get lab progress for virtual labs
    const labProgressList = await learningDb
      .select({
        labWorkId: labProgress.labWorkId,
        status: labProgress.status,
        completedAt: labProgress.completedAt,
      })
      .from(labProgress)
      .where(eq(labProgress.localUserId, studentId));

    // Group by topic
    const topicsWithSubtopics = enrollmentsList.map(enrollment => {
      const topicSubs = subtopicNodesList.filter(
        s => s.parentId === enrollment.topicNodeId
      );
      const subsWithProgress = topicSubs.map(sub => {
        const prog = progress.find(p => p.subtopicNodeId === sub.id);
        const isCurrent = enrollment.currentSubtopicNodeId === sub.id;
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
        topicNodeId: enrollment.topicNodeId,
        topicTitle: enrollment.topicTitle,
        topicColor: enrollment.topicColor,
        enrollmentStatus: enrollment.status,
        startedAt: enrollment.startedAt,
        completedAt: enrollment.completedAt,
        comment: enrollment.comment,
        currentSubtopicNodeId: enrollment.currentSubtopicNodeId,
        subtopics: subsWithProgress,
        labs: [] as {
          id: number;
          title: string;
          slug: string;
          shortDesc: string | null;
        }[],
      };
    });

    return { topics: topicsWithSubtopics, labProgress: labProgressList };
  }),

  // ── Get current active topics ──
  getCurrentTopics: studentQuery.query(async ({ ctx }) => {
    const contentDb = getContentDb();
    const learningDb = getLearningDb();
    const studentId = ctx.localUser!.id;

    if (ctx.role?.name === "admin") {
      // Admin sees the first topic as current
      const firstTopic = await contentDb
        .select()
        .from(topicNodes)
        .where(isNull(topicNodes.parentId))
        .orderBy(topicNodes.order)
        .limit(1);
      if (!firstTopic.length) return [];
      const topic = firstTopic[0];
      const topicSubtopics = await contentDb
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.parentId, topic.id))
        .orderBy(topicNodes.order)
        .limit(1);
      return [
        {
          subtopic: topicSubtopics[0] ?? null,
          topic,
          labs: [] as {
            id: number;
            title: string;
            slug: string;
            shortDesc: string | null;
          }[],
          enrollmentComment: null,
        },
      ];
    }

    const currentItems: {
      subtopicNodeId: number;
      topicNodeId: number | null;
      enrollmentComment: string | null;
    }[] = [];

    // 1. Current subtopics from active enrollments
    const activeEnrollments = await learningDb
      .select({
        id: enrollments.id,
        topicNodeId: enrollments.topicNodeId,
        currentSubtopicNodeId: enrollments.currentSubtopicNodeId,
        comment: enrollments.comment,
      })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.localUserId, studentId),
          eq(enrollments.status, "active"),
          sql`${enrollments.currentSubtopicNodeId} IS NOT NULL`
        )
      );

    for (const e of activeEnrollments) {
      currentItems.push({
        subtopicNodeId: e.currentSubtopicNodeId!,
        topicNodeId: e.topicNodeId,
        enrollmentComment: e.comment,
      });
    }

    // 2. All subtopics explicitly marked as in_progress
    const existingSubtopicNodeIds = new Set(
      currentItems.map(i => i.subtopicNodeId)
    );
    const inProgressProgress = await learningDb
      .select({
        subtopicNodeId: studentProgress.subtopicNodeId,
      })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.localUserId, studentId),
          eq(studentProgress.status, "in_progress")
        )
      );

    for (const row of inProgressProgress) {
      if (!existingSubtopicNodeIds.has(row.subtopicNodeId)) {
        currentItems.push({
          subtopicNodeId: row.subtopicNodeId,
          topicNodeId: null,
          enrollmentComment: null,
        });
        existingSubtopicNodeIds.add(row.subtopicNodeId);
      }
    }

    if (!currentItems.length) {
      return [];
    }

    // Fetch related data in batches
    const subtopicNodeIds = currentItems.map(i => i.subtopicNodeId);
    const subtopicRows = await contentDb
      .select()
      .from(topicNodes)
      .where(inArray(topicNodes.id, subtopicNodeIds));
    const subtopicById = new Map(subtopicRows.map(s => [s.id, s]));

    const topicNodeIdsSet = new Set<number>();
    for (const item of currentItems) {
      if (item.topicNodeId) {
        topicNodeIdsSet.add(item.topicNodeId);
      } else {
        const s = subtopicById.get(item.subtopicNodeId);
        if (s?.parentId) topicNodeIdsSet.add(s.parentId);
      }
    }
    const topicNodeIds = Array.from(topicNodeIdsSet);
    const topicRows =
      topicNodeIds.length > 0
        ? await contentDb
            .select()
            .from(topicNodes)
            .where(inArray(topicNodes.id, topicNodeIds))
        : [];
    const topicById = new Map(topicRows.map(t => [t.id, t]));

    // Keep a stable order: topic order → subtopic order
    currentItems.sort((a, b) => {
      const aSubtopic = subtopicById.get(a.subtopicNodeId);
      const bSubtopic = subtopicById.get(b.subtopicNodeId);
      const aTopicNodeId = a.topicNodeId ?? aSubtopic?.parentId ?? 0;
      const bTopicNodeId = b.topicNodeId ?? bSubtopic?.parentId ?? 0;
      const aTopic = aTopicNodeId ? topicById.get(aTopicNodeId) : undefined;
      const bTopic = bTopicNodeId ? topicById.get(bTopicNodeId) : undefined;
      const topicDiff = (aTopic?.order ?? 0) - (bTopic?.order ?? 0);
      if (topicDiff !== 0) return topicDiff;
      return (aSubtopic?.order ?? 0) - (bSubtopic?.order ?? 0);
    });

    return currentItems.map(item => {
      const subtopic = subtopicById.get(item.subtopicNodeId) ?? null;
      const topicNodeId = item.topicNodeId ?? subtopic?.parentId;
      const topic = topicNodeId ? (topicById.get(topicNodeId) ?? null) : null;
      return {
        subtopic,
        topic,
        labs: [] as {
          id: number;
          title: string;
          slug: string;
          shortDesc: string | null;
        }[],
        enrollmentComment: item.enrollmentComment,
      };
    });
  }),

  // ── Get recent activity ──
  getActivity: studentQuery.query(async ({ ctx }) => {
    const learningDb = getLearningDb();
    const studentId = ctx.localUser!.id;

    // Last opened topic (latest enrollment)
    const lastEnrollment = await learningDb
      .select({
        id: enrollments.id,
        topicNodeId: enrollments.topicNodeId,
        enrolledAt: enrollments.enrolledAt,
        status: enrollments.status,
      })
      .from(enrollments)
      .where(eq(enrollments.localUserId, studentId))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(1);

    // Last completed topic
    const lastCompleted = await learningDb
      .select({
        id: enrollments.id,
        topicNodeId: enrollments.topicNodeId,
        completedAt: enrollments.completedAt,
      })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.localUserId, studentId),
          eq(enrollments.status, "completed")
        )
      )
      .orderBy(desc(enrollments.completedAt))
      .limit(1);

    // Last completed subtopic
    const lastCompletedSubtopic = await learningDb
      .select({
        subtopicNodeId: studentProgress.subtopicNodeId,
        completedAt: studentProgress.completedAt,
      })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.localUserId, studentId),
          eq(studentProgress.status, "completed")
        )
      )
      .orderBy(desc(studentProgress.completedAt))
      .limit(1);

    // Last completed lab
    const lastCompletedLab = await learningDb
      .select({
        labWorkId: labProgress.labWorkId,
        completedAt: labProgress.completedAt,
      })
      .from(labProgress)
      .where(
        and(
          eq(labProgress.localUserId, studentId),
          eq(labProgress.status, "completed")
        )
      )
      .orderBy(desc(labProgress.completedAt))
      .limit(1);

    // Last login
    const user = await findLocalUserById(studentId);

    return {
      lastEnrollment: lastEnrollment[0] ?? null,
      lastCompletedTopic: lastCompleted[0] ?? null,
      lastCompletedSubtopic: lastCompletedSubtopic[0] ?? null,
      // Field names preserved for API compatibility; values now reference topic_nodes.
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
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "Login must be alphanumeric with underscores"
          ),
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

      const authDb = getAuthDb();
      const [found] = await authDb
        .select({ id: localUsers.id })
        .from(localUsers)
        .where(eq(localUsers.login, input.login))
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
        subtopicNodeId: z.number().positive(),
        status: z.enum(["not_started", "in_progress", "completed"]).optional(),
        theoryCompleted: z.boolean().optional(),
        practiceCompleted: z.boolean().optional(),
        labCompleted: z.boolean().optional(),
        comment: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contentDb = getContentDb();
      const learningDb = getLearningDb();
      const { studentId, subtopicNodeId, ...data } = input;

      // Check if student exists
      const student = await findLocalUserById(studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Check if subtopic node exists
      const [subtopic] = await contentDb
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.id, subtopicNodeId))
        .limit(1);
      if (!subtopic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subtopic not found",
        });
      }

      // Find existing progress
      const [existing] = await learningDb
        .select()
        .from(studentProgress)
        .where(
          and(
            eq(studentProgress.localUserId, studentId),
            eq(studentProgress.subtopicNodeId, subtopicNodeId)
          )
        )
        .limit(1);

      const updateData: Partial<StudentProgress> = {};
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
        updateData.theoryCompleted = data.theoryCompleted
          ? "completed"
          : "pending";
      }
      if (data.practiceCompleted !== undefined) {
        updateData.practiceCompleted = data.practiceCompleted
          ? "completed"
          : "pending";
      }
      if (data.labCompleted !== undefined) {
        updateData.labCompleted = data.labCompleted ? "completed" : "pending";
      }
      if (data.comment !== undefined) {
        updateData.comment = data.comment;
      }

      if (existing) {
        await learningDb
          .update(studentProgress)
          .set(updateData)
          .where(eq(studentProgress.id, existing.id));
      } else {
        await learningDb.insert(studentProgress).values({
          localUserId: studentId,
          subtopicNodeId,
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
        details: { studentId, subtopicNodeId, ...data },
      });

      return { success: true };
    }),

  // ── Admin: Get student progress for a topic ──
  getTopicProgress: adminQuery
    .input(
      z.object({
        studentId: z.number().positive(),
        topicNodeId: z.number().positive(),
      })
    )
    .query(async ({ input }) => {
      const contentDb = getContentDb();
      const learningDb = getLearningDb();
      const subtopicNodesList = await contentDb
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.parentId, input.topicNodeId))
        .orderBy(topicNodes.order);

      const subtopicNodeIds = subtopicNodesList.map(s => s.id);

      const progress =
        subtopicNodeIds.length > 0
          ? await learningDb
              .select()
              .from(studentProgress)
              .where(
                and(
                  eq(studentProgress.localUserId, input.studentId),
                  inArray(studentProgress.subtopicNodeId, subtopicNodeIds)
                )
              )
          : [];

      return subtopicNodesList.map(sub => {
        const prog = progress.find(p => p.subtopicNodeId === sub.id);
        return {
          subtopicNodeId: sub.id,
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
    const jupyterDb = getJupyterDb();
    const contentDb = getContentDb();
    const studentId = ctx.localUser!.id;

    const assignedRows = await getAssignedJupyterNotebooksByStudent(studentId);
    const assignedNotebookIds = new Set(assignedRows.map(r => r.notebookId));

    const accesses = await jupyterDb
      .select({ notebookId: jupyterNotebookAccess.notebookId })
      .from(jupyterNotebookAccess)
      .where(eq(jupyterNotebookAccess.localUserId, studentId));

    const availableNotebookIds = accesses
      .map(a => a.notebookId)
      .filter(id => !assignedNotebookIds.has(id));

    let available: Array<{
      id: number;
      notebookId: number;
      title: string;
      filename: string;
      filePath: string;
      subtopicTitle: string;
      status: "available";
    }> = [];

    if (availableNotebookIds.length > 0) {
      const notebooks = await jupyterDb
        .select()
        .from(jupyterNotebooks)
        .where(inArray(jupyterNotebooks.id, availableNotebookIds));

      const subtopicList = await contentDb
        .select({ id: topicNodes.id, title: topicNodes.title })
        .from(topicNodes)
        .where(
          inArray(
            topicNodes.id,
            notebooks.map(n => n.subtopicNodeId)
          )
        );
      const subtopicMap = new Map(subtopicList.map(s => [s.id, s.title]));

      available = notebooks.map(n => ({
        id: n.id,
        notebookId: n.id,
        title: n.title,
        filename: n.filename,
        filePath: n.filePath,
        subtopicTitle: subtopicMap.get(n.subtopicNodeId) ?? "—",
        status: "available" as const,
      }));
    }

    return {
      assigned: assignedRows.filter(r => r.status === "assigned"),
      submitted: assignedRows.filter(r => r.status === "submitted"),
      completed: assignedRows.filter(r => r.status === "completed"),
      available,
    };
  }),

  getAssignedJupyterNotebookById: studentQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ ctx, input }) => {
      const assignment = await getAssignedJupyterNotebookById(input.id);
      if (!assignment || assignment.localUserId !== ctx.localUser!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ноутбук не найден",
        });
      }
      return {
        id: assignment.id,
        status: assignment.status,
        grade: assignment.grade,
        studentColabUrl: assignment.studentColabUrl,
        teacherComment: assignment.teacherComment,
        assignedAt: assignment.assignedAt,
        submittedAt: assignment.submittedAt,
        completedAt: assignment.completedAt,
        notebookId: assignment.notebookId,
        notebookTitle: assignment.notebookTitle,
        notebookFilename: assignment.notebookFilename,
        notebookFilePath: assignment.notebookFilePath,
        subtopicTitle: assignment.subtopicTitle,
      };
    }),

  submitJupyterNotebookSolution: studentQuery
    .input(
      z.object({
        assignmentId: z.number().positive(),
        studentColabUrl: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const assignment = await getAssignedJupyterNotebookById(
        input.assignmentId
      );
      if (!assignment || assignment.localUserId !== ctx.localUser!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ноутбук не найден",
        });
      }
      if (assignment.status === "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ноутбук уже проверен",
        });
      }

      await updateAssignedJupyterNotebook(input.assignmentId, {
        status: "submitted",
        studentColabUrl: input.studentColabUrl,
        submittedAt: new Date(),
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // Student Notifications
  // ═══════════════════════════════════════════════════════════

  getNotifications: studentQuery.query(async ({ ctx }) => {
    const notificationsDb = getNotificationsDb();
    return notificationsDb
      .select()
      .from(notifications)
      .where(eq(notifications.localUserId, ctx.localUser!.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }),

  getUnreadNotificationCount: studentQuery.query(async ({ ctx }) => {
    const notificationsDb = getNotificationsDb();
    const result = await notificationsDb
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.localUserId, ctx.localUser!.id),
          eq(notifications.read, false)
        )
      );
    return result[0]?.count ?? 0;
  }),

  markNotificationRead: studentQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const notificationsDb = getNotificationsDb();
      await notificationsDb
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.localUserId, ctx.localUser!.id)
          )
        );
      return { success: true };
    }),

  markAllNotificationsRead: studentQuery.mutation(async ({ ctx }) => {
    const notificationsDb = getNotificationsDb();
    await notificationsDb
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.localUserId, ctx.localUser!.id));
    return { success: true };
  }),

  // ── Get my assigned lab works (active + archived) ──
  getMyAssignedLabWorks: studentQuery.query(async ({ ctx }) => {
    const rows = await getAssignedLabWorksByStudent(ctx.localUser!.id);
    const active = rows.filter(r => r.status === "assigned");
    const archived = rows.filter(r => r.status === "completed");
    return { active, archived };
  }),

  // ── Get my assigned problems (active + archived) ──
  getMyAssignedProblems: studentQuery.query(async ({ ctx }) => {
    const rows = await getAssignedProblemsByStudent(ctx.localUser!.id);
    const active = rows.filter(r => r.status !== "completed");
    const archived = rows.filter(r => r.status === "completed");
    return { active, archived };
  }),

  // ── Get a single assigned problem for solving ──
  getAssignedProblemById: studentQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ ctx, input }) => {
      const assignment = await getAssignedProblemById(input.id);
      if (!assignment || assignment.localUserId !== ctx.localUser!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Задача не найдена",
        });
      }
      return {
        id: assignment.id,
        status: assignment.status,
        grade: assignment.grade,
        studentAnswer: assignment.studentAnswer,
        solutionImageUrl: assignment.solutionImageUrl,
        submittedAt: assignment.submittedAt,
        teacherComment: assignment.teacherComment,
        assignedAt: assignment.assignedAt,
        completedAt: assignment.completedAt,
        problemId: assignment.problemId,
        problemTitle: assignment.problemTitle,
        problemSlug: assignment.problemSlug,
        problemDifficulty: assignment.problemDifficulty,
        problemCondition: assignment.problemCondition,
      };
    }),

  // ── Submit a problem solution (photo + answer) ──
  submitProblemSolution: studentQuery
    .input(
      z.object({
        assignmentId: z.number().positive(),
        answer: z.string().min(1).max(5000),
        solutionImageUrl: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const assignment = await getAssignedProblemById(input.assignmentId);
      if (!assignment || assignment.localUserId !== ctx.localUser!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Задача не найдена",
        });
      }
      if (assignment.status === "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Задача уже проверена",
        });
      }

      await updateAssignedProblem(input.assignmentId, {
        status: "submitted",
        studentAnswer: input.answer,
        solutionImageUrl: input.solutionImageUrl ?? null,
        submittedAt: new Date(),
      });

      return { success: true };
    }),

  // ── Get unread notification counts per tab type ──
  getUnreadNotificationCounts: studentQuery.query(async ({ ctx }) => {
    const notificationsDb = getNotificationsDb();
    const studentId = ctx.localUser!.id;

    const types = ["lab", "problem", "jupyter_notebook"] as const;
    const counts = await Promise.all(
      types.map(async type => {
        const result = await notificationsDb
          .select({ count: count() })
          .from(notifications)
          .where(
            and(
              eq(notifications.localUserId, studentId),
              eq(notifications.type, type),
              eq(notifications.read, false)
            )
          );
        return { type, count: result[0]?.count ?? 0 };
      })
    );

    return {
      lab: counts.find(c => c.type === "lab")?.count ?? 0,
      problem: counts.find(c => c.type === "problem")?.count ?? 0,
      notebook: counts.find(c => c.type === "jupyter_notebook")?.count ?? 0,
    };
  }),

  // ── Mark all notifications of a specific type as read ──
  markNotificationsReadByType: studentQuery
    .input(
      z.object({
        type: z.enum(["lab", "problem", "jupyter_notebook"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notificationsDb = getNotificationsDb();
      await notificationsDb
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.localUserId, ctx.localUser!.id),
            eq(notifications.type, input.type)
          )
        );
      return { success: true };
    }),

  // ── Get last 6 completed labs and problems mixed ──
  getRecentCompletedAssignments: studentQuery.query(async ({ ctx }) => {
    const [labRows, problemRows] = await Promise.all([
      getAssignedLabWorksByStudent(ctx.localUser!.id),
      getAssignedProblemsByStudent(ctx.localUser!.id),
    ]);

    const completedLabs = labRows
      .filter(r => r.status === "completed" && r.completedAt)
      .map(r => ({
        id: r.id,
        type: "lab" as const,
        title: r.labTitle,
        slug: r.labSlug,
        completedAt: r.completedAt!,
        grade: r.grade,
      }));

    const completedProblems = problemRows
      .filter(r => r.status === "completed" && r.completedAt)
      .map(r => ({
        id: r.id,
        type: "problem" as const,
        title: r.problemTitle,
        slug: r.problemSlug,
        completedAt: r.completedAt!,
        grade: r.grade,
      }));

    const combined = [...completedLabs, ...completedProblems].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    return combined.slice(0, 6);
  }),
});
