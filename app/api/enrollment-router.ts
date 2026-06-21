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
  getEnrollmentsWithDetails,
  createEnrollment,
  updateEnrollmentStatus,
  updateEnrollmentDetails,
  deleteEnrollment,
  isEnrolled,
} from "./queries/enrollments";
import { findLocalUserById } from "./queries/localUsers";
import { createAuditEntry } from "./queries/audit";
import { getContentDb } from "./queries/connection";
import { topicNodes } from "@db/schema/content";
import { eq, and, isNull, isNotNull } from "drizzle-orm";

export const enrollmentRouter = createRouter({
  // ── Admin: List enrollments for a student ──
  listForStudent: adminQuery
    .input(z.object({ studentId: z.number().positive() }))
    .query(async ({ input }) => {
      const student = await findLocalUserById(input.studentId);
      if (!student) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }

      const contentDb = getContentDb();
      const [topic] = await contentDb
        .select()
        .from(topicNodes)
        .where(
          and(
            eq(topicNodes.id, input.topicNodeId),
            isNull(topicNodes.parentId)
          )
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
          and(
            eq(topicNodes.parentId, topic.id),
            isNotNull(topicNodes.content)
          )
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
});
