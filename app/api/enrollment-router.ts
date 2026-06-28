/**
 * Enrollment Router
 *
 * Manages student course enrollments.
 * Admin endpoints for CRUD, student endpoint for viewing own enrollments.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, adminQuery, studentQuery } from "./middleware";
import {
  findEnrollment,
  getEnrollmentById,
  getEnrollmentsWithDetails,
  createEnrollment,
  updateEnrollmentStatus,
  updateEnrollmentDetails,
  deleteEnrollment,
  isEnrolled,
} from "./queries/enrollments";
import { findLocalUserById } from "./queries/localUsers";
import { createAuditEntry } from "./queries/audit";
import {
  getContentDb,
  getLearningDb,
  getNotificationsDb,
  getJupyterDb,
} from "./queries/connection";
import { topicNodes } from "@db/schema/content";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { notifications } from "@db/schema/notifications";
import {
  getAssignedLabWorksByEnrollment,
  findAssignedLabWork,
  createAssignedLabWork,
  updateAssignedLabWork,
  deleteAssignedLabWork,
  getMaxOrderForEnrollment,
} from "./queries/assignedLabWorks";
import {
  getAssignedProblemsByEnrollment,
  findAssignedProblem,
  createAssignedProblem,
  updateAssignedProblem,
  deleteAssignedProblem,
  getMaxOrderForProblems,
} from "./queries/assignedProblems";
import {
  getAssignedJupyterNotebooksByEnrollment,
  findAssignedJupyterNotebook,
  createAssignedJupyterNotebook,
  updateAssignedJupyterNotebook,
  deleteAssignedJupyterNotebook,
  getMaxOrderForJupyterNotebooks,
} from "./queries/assignedJupyterNotebooks";
import { jupyterNotebooks, jupyterNotebookAccess } from "@db/schema/jupyter";
import { assignedJupyterNotebooks } from "@db/schema/learning";

export const enrollmentRouter = createRouter({
  // ── Admin: List enrollments for a student ──
  listForStudent: adminQuery
    .input(z.object({ studentId: z.number().positive() }))
    .query(async ({ input }) => {
      const student = await findLocalUserById(input.studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      return getEnrollmentsWithDetails(input.studentId);
    }),

  // ── Admin: Enroll a student in a topic node ──
  enroll: adminQuery
    .input(
      z.object({
        studentId: z.number().positive(),
        topicNodeId: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const student = await findLocalUserById(input.studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      const contentDb = getContentDb();
      const [topic] = await contentDb
        .select()
        .from(topicNodes)
        .where(
          and(eq(topicNodes.id, input.topicNodeId), isNull(topicNodes.parentId))
        )
        .limit(1);
      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course topic not found",
        });
      }

      const [child] = await contentDb
        .select({ count: topicNodes.id })
        .from(topicNodes)
        .where(
          and(eq(topicNodes.parentId, topic.id), isNotNull(topicNodes.content))
        )
        .limit(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const childCount = (child as any)?.count ?? 0;
      if (!childCount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot enroll: topic has no subtopics",
        });
      }

      const existing = await findEnrollment(input.studentId, input.topicNodeId);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Student already enrolled in this topic",
        });
      }

      await createEnrollment({
        localUserId: input.studentId,
        topicNodeId: input.topicNodeId,
        createdBy: ctx.localUser!.id,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "enroll",
        resource: "enrollments",
        details: { studentId: input.studentId, topicNodeId: input.topicNodeId },
      });

      return { success: true };
    }),

  // ── Admin: Unenroll a student ──
  unenroll: adminQuery
    .input(z.object({ enrollmentId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await deleteEnrollment(input.enrollmentId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "unenroll",
        resource: "enrollments",
        resourceId: input.enrollmentId,
      });

      return { success: true };
    }),

  // ── Admin: Update enrollment status ──
  updateStatus: adminQuery
    .input(
      z.object({
        enrollmentId: z.number().positive(),
        status: z.enum(["active", "completed", "suspended"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateEnrollmentStatus(input.enrollmentId, input.status);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "enrollments",
        resourceId: input.enrollmentId,
        details: { status: input.status },
      });

      return { success: true };
    }),

  // ── Admin: Update enrollment details ──
  updateDetails: adminQuery
    .input(
      z.object({
        enrollmentId: z.number().positive(),
        status: z.enum(["active", "completed", "suspended"]).optional(),
        currentSubtopicNodeId: z.number().positive().nullable().optional(),
        comment: z.string().max(500).optional(),
        startedAt: z.date().nullable().optional(),
        completedAt: z.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { enrollmentId, ...data } = input;
      await updateEnrollmentDetails(enrollmentId, {
        status: data.status,
        currentSubtopicNodeId: data.currentSubtopicNodeId,
        comment: data.comment,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "enrollments",
        resourceId: enrollmentId,
        details: { ...data },
      });

      return { success: true };
    }),

  // ── Student: Check enrollment ──
  check: studentQuery
    .input(z.object({ topicNodeId: z.number().positive() }))
    .query(async ({ ctx, input }) => {
      return isEnrolled(ctx.localUser!.id, input.topicNodeId);
    }),

  // ═══════════════════════════════════════════════════════════════
  // ADMIN: Assigned Lab Works
  // ═══════════════════════════════════════════════════════════════

  listAssignedLabWorks: adminQuery
    .input(z.object({ enrollmentId: z.number().positive() }))
    .query(async ({ input }) => {
      return getAssignedLabWorksByEnrollment(input.enrollmentId);
    }),

  assignLabWork: adminQuery
    .input(
      z.object({
        enrollmentId: z.number().positive(),
        labWorkId: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const enrollment = await getEnrollmentById(input.enrollmentId);
      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      const existing = await findAssignedLabWork(
        input.enrollmentId,
        input.labWorkId
      );
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Lab work already assigned for this enrollment",
        });
      }

      const maxOrder = await getMaxOrderForEnrollment(input.enrollmentId);

      const result = await createAssignedLabWork({
        enrollmentId: input.enrollmentId,
        localUserId: enrollment.localUserId,
        labWorkId: input.labWorkId,
        order: maxOrder + 1,
        assignedBy: ctx.localUser!.id,
      });

      const assignmentId = Number(result[0].insertId);

      const notificationsDb = getNotificationsDb();
      await notificationsDb.insert(notifications).values({
        localUserId: enrollment.localUserId,
        type: "lab",
        title: "Назначена новая лабораторная работа",
        message:
          "Вам назначена новая лабораторная работа. Перейдите во вкладку «Мои Лабораторные».",
        resourceId: assignmentId,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "assigned_lab_works",
        resourceId: assignmentId,
        details: {
          enrollmentId: input.enrollmentId,
          labWorkId: input.labWorkId,
          localUserId: enrollment.localUserId,
        },
      });

      return { id: assignmentId, success: true };
    }),

  unassignLabWork: adminQuery
    .input(z.object({ assignmentId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await deleteAssignedLabWork(input.assignmentId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "assigned_lab_works",
        resourceId: input.assignmentId,
      });

      return { success: true };
    }),

  updateAssignedLabWork: adminQuery
    .input(
      z.object({
        assignmentId: z.number().positive(),
        status: z.enum(["assigned", "completed"]).optional(),
        grade: z.number().int().min(1).max(5).nullable().optional(),
        teacherComment: z.string().max(2000).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, status, grade, teacherComment } = input;

      await updateAssignedLabWork(assignmentId, {
        status,
        grade: grade === null ? null : grade,
        teacherComment: teacherComment === null ? null : teacherComment,
        completedAt:
          status === "completed"
            ? new Date()
            : status === "assigned"
              ? null
              : undefined,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "assigned_lab_works",
        resourceId: assignmentId,
        details: { status, grade },
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════════
  // ADMIN: Assigned Problems
  // ═══════════════════════════════════════════════════════════════

  listAssignedProblems: adminQuery
    .input(z.object({ enrollmentId: z.number().positive() }))
    .query(async ({ input }) => {
      return getAssignedProblemsByEnrollment(input.enrollmentId);
    }),

  assignProblem: adminQuery
    .input(
      z.object({
        enrollmentId: z.number().positive(),
        problemId: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const enrollment = await getEnrollmentById(input.enrollmentId);
      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      const existing = await findAssignedProblem(
        input.enrollmentId,
        input.problemId
      );
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Problem already assigned for this enrollment",
        });
      }

      const maxOrder = await getMaxOrderForProblems(input.enrollmentId);

      const result = await createAssignedProblem({
        enrollmentId: input.enrollmentId,
        localUserId: enrollment.localUserId,
        problemId: input.problemId,
        order: maxOrder + 1,
        assignedBy: ctx.localUser!.id,
      });

      const assignmentId = Number(result[0].insertId);

      const notificationsDb = getNotificationsDb();
      await notificationsDb.insert(notifications).values({
        localUserId: enrollment.localUserId,
        type: "problem",
        title: "Назначена новая задача",
        message:
          "Вам назначена новая задача. Перейдите во вкладку «Мои Задачи».",
        resourceId: assignmentId,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "assigned_problems",
        resourceId: assignmentId,
        details: {
          enrollmentId: input.enrollmentId,
          problemId: input.problemId,
          localUserId: enrollment.localUserId,
        },
      });

      return { id: assignmentId, success: true };
    }),

  unassignProblem: adminQuery
    .input(z.object({ assignmentId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await deleteAssignedProblem(input.assignmentId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "assigned_problems",
        resourceId: input.assignmentId,
      });

      return { success: true };
    }),

  updateAssignedProblem: adminQuery
    .input(
      z.object({
        assignmentId: z.number().positive(),
        status: z.enum(["assigned", "submitted", "completed"]).optional(),
        grade: z.number().int().min(1).max(5).nullable().optional(),
        teacherComment: z.string().max(2000).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, status, grade, teacherComment } = input;

      await updateAssignedProblem(assignmentId, {
        status,
        grade: grade === null ? null : grade,
        teacherComment: teacherComment === null ? null : teacherComment,
        completedAt:
          status === "completed"
            ? new Date()
            : status === "assigned"
              ? null
              : undefined,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "assigned_problems",
        resourceId: assignmentId,
        details: { status, grade },
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════════
  // ADMIN: Assigned Jupyter Notebooks
  // ═══════════════════════════════════════════════════════════════

  listAssignedJupyterNotebooks: adminQuery
    .input(z.object({ enrollmentId: z.number().positive() }))
    .query(async ({ input }) => {
      return getAssignedJupyterNotebooksByEnrollment(input.enrollmentId);
    }),

  assignJupyterNotebook: adminQuery
    .input(
      z.object({
        enrollmentId: z.number().positive(),
        notebookId: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const enrollment = await getEnrollmentById(input.enrollmentId);
      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      const existing = await findAssignedJupyterNotebook(
        input.enrollmentId,
        input.notebookId
      );
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Notebook already assigned for this enrollment",
        });
      }

      const maxOrder = await getMaxOrderForJupyterNotebooks(input.enrollmentId);

      const result = await createAssignedJupyterNotebook({
        enrollmentId: input.enrollmentId,
        localUserId: enrollment.localUserId,
        notebookId: input.notebookId,
        order: maxOrder + 1,
        assignedBy: ctx.localUser!.id,
      });

      const assignmentId = Number(result[0].insertId);

      const jupyterDb = getJupyterDb();

      // Ensure the student has download access to the notebook
      const existingAccess = await jupyterDb
        .select()
        .from(jupyterNotebookAccess)
        .where(
          and(
            eq(jupyterNotebookAccess.notebookId, input.notebookId),
            eq(jupyterNotebookAccess.localUserId, enrollment.localUserId)
          )
        )
        .limit(1);

      if (existingAccess.length === 0) {
        await jupyterDb.insert(jupyterNotebookAccess).values({
          notebookId: input.notebookId,
          localUserId: enrollment.localUserId,
          grantedBy: ctx.localUser!.id,
        });
      }

      const notebook = await jupyterDb
        .select()
        .from(jupyterNotebooks)
        .where(eq(jupyterNotebooks.id, input.notebookId))
        .limit(1);

      const notificationsDb = getNotificationsDb();
      await notificationsDb.insert(notifications).values({
        localUserId: enrollment.localUserId,
        type: "jupyter_notebook",
        title: "Назначен новый Jupyter-ноутбук",
        message: `Вам назначен ноутбук "${notebook[0]?.title ?? "—"}". Перейдите во вкладку «Мои Тетради».`,
        resourceId: assignmentId,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "assigned_jupyter_notebooks",
        resourceId: assignmentId,
        details: {
          enrollmentId: input.enrollmentId,
          notebookId: input.notebookId,
          localUserId: enrollment.localUserId,
        },
      });

      return { id: assignmentId, success: true };
    }),

  unassignJupyterNotebook: adminQuery
    .input(z.object({ assignmentId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const learningDb = getLearningDb();
      const jupyterDb = getJupyterDb();

      const [assignment] = await learningDb
        .select()
        .from(assignedJupyterNotebooks)
        .where(eq(assignedJupyterNotebooks.id, input.assignmentId))
        .limit(1);

      await deleteAssignedJupyterNotebook(input.assignmentId);

      if (assignment) {
        const remaining = await learningDb
          .select()
          .from(assignedJupyterNotebooks)
          .where(
            and(
              eq(assignedJupyterNotebooks.localUserId, assignment.localUserId),
              eq(assignedJupyterNotebooks.notebookId, assignment.notebookId)
            )
          )
          .limit(1);

        if (remaining.length === 0) {
          await jupyterDb
            .delete(jupyterNotebookAccess)
            .where(
              and(
                eq(jupyterNotebookAccess.notebookId, assignment.notebookId),
                eq(jupyterNotebookAccess.localUserId, assignment.localUserId)
              )
            );
        }
      }

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "assigned_jupyter_notebooks",
        resourceId: input.assignmentId,
      });

      return { success: true };
    }),

  updateAssignedJupyterNotebook: adminQuery
    .input(
      z.object({
        assignmentId: z.number().positive(),
        status: z.enum(["assigned", "submitted", "completed"]).optional(),
        grade: z.number().int().min(1).max(5).nullable().optional(),
        teacherComment: z.string().max(2000).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, status, grade, teacherComment } = input;

      await updateAssignedJupyterNotebook(assignmentId, {
        status,
        grade: grade === null ? null : grade,
        teacherComment: teacherComment === null ? null : teacherComment,
        completedAt:
          status === "completed"
            ? new Date()
            : status === "assigned"
              ? null
              : undefined,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "assigned_jupyter_notebooks",
        resourceId: assignmentId,
        details: { status, grade },
      });

      return { success: true };
    }),
});
