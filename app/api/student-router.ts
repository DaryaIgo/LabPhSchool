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
import { eq, and, desc, sql, inArray, count } from "drizzle-orm";

import {
  getAuthDb,
  getContentDb,
  getLearningDb,
  getProblemsDb,
  getJupyterDb,
  getNotificationsDb,
} from "./queries/connection";

import { localUsers } from "@db/schema/auth";
import { topics, subtopics, labs } from "@db/schema/content";
import {
  enrollments,
  studentProgress,
  labProgress,
  type StudentProgress,
} from "@db/schema/learning";
import { problemTypes } from "@db/schema/problems";
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
        .from(topics)
        .orderBy(topics.order);
      return allTopics.map(t => ({
        id: 0,
        localUserId: ctx.localUser!.id,
        topicId: t.id,
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

    // Get enrollments with topics
    let enrollmentsList;
    if (ctx.role?.name === "admin") {
      const allTopics = await contentDb
        .select()
        .from(topics)
        .orderBy(topics.order);
      enrollmentsList = allTopics.map(t => ({
        id: 0,
        localUserId: studentId,
        topicId: t.id,
        status: "active" as const,
        startedAt: null as Date | null,
        completedAt: null as Date | null,
        comment: null as string | null,
        currentSubtopicId: null as number | null,
        enrolledAt: new Date(),
        expiresAt: null as Date | null,
        topicTitle: t.title,
        topicSlug: t.slug,
        topicColor: t.color,
      }));
    } else {
      enrollmentsList = await getEnrollmentsWithDetails(studentId);
    }

    // Get progress for all existing subtopics (overall course progress)
    const allSubtopics = await contentDb
      .select({ id: subtopics.id, topicId: subtopics.topicId })
      .from(subtopics);

    const allSubtopicIds = allSubtopics.map(s => s.id);

    const progress: StudentProgress[] =
      allSubtopicIds.length > 0
        ? await learningDb
            .select()
            .from(studentProgress)
            .where(
              and(
                eq(studentProgress.localUserId, studentId),
                inArray(studentProgress.subtopicId, allSubtopicIds)
              )
            )
        : [];

    // Calculate stats
    const totalSubtopics = allSubtopics.length;
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
        allSubtopics.filter(s => s.topicId === e.topicId).map(s => s.id)
      );
      const topicSubtopics = progress.filter(p =>
        topicSubtopicIds.has(p.subtopicId)
      );
      const topicCompleted = topicSubtopics.filter(
        p => p.status === "completed"
      ).length;
      const topicTotal = topicSubtopics.length;
      return {
        topicId: e.topicId,
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
        .from(topics)
        .orderBy(topics.order);
      enrollmentsList = allTopics.map(t => ({
        id: 0,
        localUserId: studentId,
        topicId: t.id,
        status: "active" as const,
        startedAt: null as Date | null,
        completedAt: null as Date | null,
        comment: null as string | null,
        currentSubtopicId: null as number | null,
        enrolledAt: new Date(),
        expiresAt: null as Date | null,
        topicTitle: t.title,
        topicSlug: t.slug,
        topicColor: t.color,
      }));
    } else {
      enrollmentsList = await getEnrollmentsWithDetails(studentId);
    }
    const enrolledTopicIds = enrollmentsList.map(e => e.topicId);

    if (enrolledTopicIds.length === 0) {
      return { topics: [] };
    }

    // Get all subtopics for enrolled topics
    const subtopicsList = await contentDb
      .select({
        id: subtopics.id,
        topicId: subtopics.topicId,
        title: subtopics.title,
        order: subtopics.order,
        jupyterUrl: subtopics.jupyterUrl,
      })
      .from(subtopics)
      .where(inArray(subtopics.topicId, enrolledTopicIds))
      .orderBy(subtopics.topicId, subtopics.order);

    const subtopicIds = subtopicsList.map(s => s.id);

    // Get progress for these subtopics
    const progress =
      subtopicIds.length > 0
        ? await learningDb
            .select()
            .from(studentProgress)
            .where(
              and(
                eq(studentProgress.localUserId, studentId),
                inArray(studentProgress.subtopicId, subtopicIds)
              )
            )
        : [];

    // Get legacy labs for these topics
    const topicLabs =
      enrolledTopicIds.length > 0
        ? await contentDb
            .select()
            .from(labs)
            .where(inArray(labs.topicId, enrolledTopicIds))
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
      const topicSubs = subtopicsList.filter(
        s => s.topicId === enrollment.topicId
      );
      const subsWithProgress = topicSubs.map(sub => {
        const prog = progress.find(p => p.subtopicId === sub.id);
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
        labs: topicLabs.filter(l => l.topicId === enrollment.topicId),
      };
    });

    return { topics: topicsWithSubtopics, labProgress: labProgressList };
  }),

  // ── Get current active topics ──
  getCurrentTopics: studentQuery.query(async ({ ctx }) => {
    const contentDb = getContentDb();
    const learningDb = getLearningDb();
    const problemsDb = getProblemsDb();
    const studentId = ctx.localUser!.id;

    if (ctx.role?.name === "admin") {
      // Admin sees the first topic as current
      const firstTopic = await contentDb
        .select()
        .from(topics)
        .orderBy(topics.order)
        .limit(1);
      if (!firstTopic.length) return [];
      const topic = firstTopic[0];
      const topicSubtopics = await contentDb
        .select()
        .from(subtopics)
        .where(eq(subtopics.topicId, topic.id))
        .orderBy(subtopics.order)
        .limit(1);
      const topicLabs = await contentDb
        .select()
        .from(labs)
        .where(eq(labs.topicId, topic.id));
      const subtopicProblemTypes = topicSubtopics.length
        ? await problemsDb
            .select()
            .from(problemTypes)
            .where(eq(problemTypes.subtopicId, topicSubtopics[0].id))
        : [];
      return [
        {
          subtopic: topicSubtopics[0] ?? null,
          topic,
          labs: topicLabs,
          problemTypes: subtopicProblemTypes,
          enrollmentComment: null,
        },
      ];
    }

    const currentItems: {
      subtopicId: number;
      topicId: number | null;
      enrollmentComment: string | null;
    }[] = [];

    // 1. Current subtopics from active enrollments
    const activeEnrollments = await learningDb
      .select({
        id: enrollments.id,
        topicId: enrollments.topicId,
        currentSubtopicId: enrollments.currentSubtopicId,
        comment: enrollments.comment,
      })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.localUserId, studentId),
          eq(enrollments.status, "active"),
          sql`${enrollments.currentSubtopicId} IS NOT NULL`
        )
      );

    for (const e of activeEnrollments) {
      currentItems.push({
        subtopicId: e.currentSubtopicId!,
        topicId: e.topicId,
        enrollmentComment: e.comment,
      });
    }

    // 2. All subtopics explicitly marked as in_progress
    const existingSubtopicIds = new Set(currentItems.map(i => i.subtopicId));
    const inProgressProgress = await learningDb
      .select({
        subtopicId: studentProgress.subtopicId,
      })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.localUserId, studentId),
          eq(studentProgress.status, "in_progress")
        )
      );

    for (const row of inProgressProgress) {
      if (!existingSubtopicIds.has(row.subtopicId)) {
        currentItems.push({
          subtopicId: row.subtopicId,
          topicId: null,
          enrollmentComment: null,
        });
        existingSubtopicIds.add(row.subtopicId);
      }
    }

    if (!currentItems.length) {
      return [];
    }

    // Fetch related data in batches
    const subtopicIds = currentItems.map(i => i.subtopicId);
    const subtopicRows = await contentDb
      .select()
      .from(subtopics)
      .where(inArray(subtopics.id, subtopicIds));
    const subtopicById = new Map(subtopicRows.map(s => [s.id, s]));

    const topicIdsSet = new Set<number>();
    for (const item of currentItems) {
      if (item.topicId) {
        topicIdsSet.add(item.topicId);
      } else {
        const s = subtopicById.get(item.subtopicId);
        if (s?.topicId) topicIdsSet.add(s.topicId);
      }
    }
    const topicIds = Array.from(topicIdsSet);
    const topicRows =
      topicIds.length > 0
        ? await contentDb
            .select()
            .from(topics)
            .where(inArray(topics.id, topicIds))
        : [];
    const topicById = new Map(topicRows.map(t => [t.id, t]));

    const labTopicIds = Array.from(
      new Set(
        currentItems
          .map(i => i.topicId ?? subtopicById.get(i.subtopicId)?.topicId)
          .filter((id): id is number => Boolean(id))
      )
    );
    const allLabs =
      labTopicIds.length > 0
        ? await contentDb
            .select()
            .from(labs)
            .where(inArray(labs.topicId, labTopicIds))
        : [];
    const allProblemTypes =
      subtopicIds.length > 0
        ? await problemsDb
            .select()
            .from(problemTypes)
            .where(inArray(problemTypes.subtopicId, subtopicIds))
        : [];

    // Keep a stable order: topic order → subtopic order
    currentItems.sort((a, b) => {
      const aSubtopic = subtopicById.get(a.subtopicId);
      const bSubtopic = subtopicById.get(b.subtopicId);
      const aTopicId = a.topicId ?? aSubtopic?.topicId ?? 0;
      const bTopicId = b.topicId ?? bSubtopic?.topicId ?? 0;
      const aTopic = aTopicId ? topicById.get(aTopicId) : undefined;
      const bTopic = bTopicId ? topicById.get(bTopicId) : undefined;
      const topicDiff = (aTopic?.order ?? 0) - (bTopic?.order ?? 0);
      if (topicDiff !== 0) return topicDiff;
      return (aSubtopic?.order ?? 0) - (bSubtopic?.order ?? 0);
    });

    return currentItems.map(item => {
      const subtopic = subtopicById.get(item.subtopicId) ?? null;
      const topicId = item.topicId ?? subtopic?.topicId;
      const topic = topicId ? (topicById.get(topicId) ?? null) : null;
      const topicLabs = topicId
        ? allLabs.filter(l => l.topicId === topicId)
        : [];
      const subtopicProblemTypes = allProblemTypes.filter(
        p => p.subtopicId === item.subtopicId
      );
      return {
        subtopic,
        topic,
        labs: topicLabs,
        problemTypes: subtopicProblemTypes,
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
        topicId: enrollments.topicId,
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
        topicId: enrollments.topicId,
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
        subtopicId: studentProgress.subtopicId,
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
        subtopicId: z.number().positive(),
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
      const { studentId, subtopicId, ...data } = input;

      // Check if student exists
      const student = await findLocalUserById(studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Check if subtopic exists
      const [subtopic] = await contentDb
        .select()
        .from(subtopics)
        .where(eq(subtopics.id, subtopicId))
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
            eq(studentProgress.subtopicId, subtopicId)
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
      const contentDb = getContentDb();
      const learningDb = getLearningDb();
      const subtopicsList = await contentDb
        .select()
        .from(subtopics)
        .where(eq(subtopics.topicId, input.topicId))
        .orderBy(subtopics.order);

      const subtopicIds = subtopicsList.map(s => s.id);

      const progress =
        subtopicIds.length > 0
          ? await learningDb
              .select()
              .from(studentProgress)
              .where(
                and(
                  eq(studentProgress.localUserId, input.studentId),
                  inArray(studentProgress.subtopicId, subtopicIds)
                )
              )
          : [];

      return subtopicsList.map(sub => {
        const prog = progress.find(p => p.subtopicId === sub.id);
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
    const jupyterDb = getJupyterDb();
    const contentDb = getContentDb();
    const studentId = ctx.localUser!.id;

    const accesses = await jupyterDb
      .select({
        notebookId: jupyterNotebookAccess.notebookId,
        grantedAt: jupyterNotebookAccess.grantedAt,
      })
      .from(jupyterNotebookAccess)
      .where(eq(jupyterNotebookAccess.localUserId, studentId));

    const notebookIds = accesses.map(a => a.notebookId);
    if (notebookIds.length === 0) return [];

    const notebooks = await jupyterDb
      .select()
      .from(jupyterNotebooks)
      .where(inArray(jupyterNotebooks.id, notebookIds));

    const subtopicList = await contentDb
      .select()
      .from(subtopics)
      .where(
        inArray(
          subtopics.id,
          notebooks.map(n => n.subtopicId)
        )
      );
    const subtopicMap = new Map(subtopicList.map(s => [s.id, s.title]));

    return notebooks.map(n => ({
      ...n,
      subtopicTitle: subtopicMap.get(n.subtopicId) ?? "—",
    }));
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
});
