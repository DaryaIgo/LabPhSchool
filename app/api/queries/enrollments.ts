/**
 * Enrollment Query Functions
 *
 * Manages course topic access for students.
 */

import { eq, and, inArray } from "drizzle-orm";
import { getLearningDb, getContentDb } from "./connection";
import { enrollments } from "@db/schema/learning";
import { topicNodes } from "@db/schema/content";

// ── READ ──

export async function getEnrollmentById(id: number) {
  const rows = await getLearningDb()
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, id))
    .limit(1);
  return rows.at(0);
}

export async function findEnrollment(localUserId: number, topicNodeId: number) {
  const rows = await getLearningDb()
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.localUserId, localUserId),
        eq(enrollments.topicNodeId, topicNodeId)
      )
    )
    .limit(1);
  return rows.at(0);
}

async function loadTopicNodeMap(topicNodeIds: number[]) {
  if (topicNodeIds.length === 0)
    return new Map<number, typeof topicNodes.$inferSelect>();
  const rows = await getContentDb()
    .select()
    .from(topicNodes)
    .where(inArray(topicNodes.id, topicNodeIds));
  return new Map(rows.map(t => [t.id, t]));
}

export async function getEnrollmentsByLocalUser(localUserId: number) {
  const rows = await getLearningDb()
    .select()
    .from(enrollments)
    .where(eq(enrollments.localUserId, localUserId));

  const topicNodeIds = rows.map(r => r.topicNodeId);
  const topicNodeMap = await loadTopicNodeMap(topicNodeIds);

  return rows.map(row => {
    const topic = topicNodeMap.get(row.topicNodeId);
    return {
      id: row.id,
      localUserId: row.localUserId,
      topicNodeId: row.topicNodeId,
      status: row.status,
      enrolledAt: row.enrolledAt,
      expiresAt: row.expiresAt,
      topicTitle: topic?.title ?? null,
      topicSlug: topic?.slug ?? null,
      topicColor: topic?.color ?? null,
    };
  });
}

export async function getEnrollmentsWithDetails(localUserId: number) {
  const rows = await getLearningDb()
    .select()
    .from(enrollments)
    .where(eq(enrollments.localUserId, localUserId));

  const topicNodeIds = rows.map(r => r.topicNodeId);
  const topicNodeMap = await loadTopicNodeMap(topicNodeIds);

  return rows.map(row => {
    const topic = topicNodeMap.get(row.topicNodeId);
    return {
      id: row.id,
      localUserId: row.localUserId,
      topicNodeId: row.topicNodeId,
      status: row.status,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      comment: row.comment,
      currentSubtopicNodeId: row.currentSubtopicNodeId,
      enrolledAt: row.enrolledAt,
      expiresAt: row.expiresAt,
      topicTitle: topic?.title ?? null,
      topicSlug: topic?.slug ?? null,
      topicColor: topic?.color ?? null,
    };
  });
}

export async function getActiveEnrollmentsByLocalUser(localUserId: number) {
  const rows = await getLearningDb()
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.localUserId, localUserId),
        eq(enrollments.status, "active")
      )
    );

  const topicNodeIds = rows.map(r => r.topicNodeId);
  const topicNodeMap = await loadTopicNodeMap(topicNodeIds);

  return rows.map(row => {
    const topic = topicNodeMap.get(row.topicNodeId);
    return {
      id: row.id,
      topicNodeId: row.topicNodeId,
      status: row.status,
      topicTitle: topic?.title ?? null,
      topicSlug: topic?.slug ?? null,
    };
  });
}

// ── CREATE ──

export async function createEnrollment(data: {
  localUserId: number;
  topicNodeId: number;
  createdBy: number;
}) {
  return getLearningDb().insert(enrollments).values({
    localUserId: data.localUserId,
    topicNodeId: data.topicNodeId,
    status: "active",
    createdBy: data.createdBy,
  });
}

// ── UPDATE ──

export async function updateEnrollmentStatus(
  id: number,
  status: "active" | "completed" | "suspended"
) {
  return getLearningDb()
    .update(enrollments)
    .set({ status })
    .where(eq(enrollments.id, id));
}

export async function updateEnrollmentDetails(
  id: number,
  data: {
    status?: "active" | "completed" | "suspended";
    currentSubtopicNodeId?: number | null;
    comment?: string;
    startedAt?: Date | null;
    completedAt?: Date | null;
  }
) {
  const setData: Record<string, unknown> = {};
  if (data.status !== undefined) setData.status = data.status;
  if (data.currentSubtopicNodeId !== undefined)
    setData.currentSubtopicNodeId = data.currentSubtopicNodeId;
  if (data.comment !== undefined) setData.comment = data.comment;
  if (data.startedAt !== undefined) setData.startedAt = data.startedAt;
  if (data.completedAt !== undefined) setData.completedAt = data.completedAt;

  return getLearningDb()
    .update(enrollments)
    .set(setData)
    .where(eq(enrollments.id, id));
}

// ── DELETE ──

export async function deleteEnrollment(id: number) {
  return getLearningDb().delete(enrollments).where(eq(enrollments.id, id));
}

export async function isEnrolled(
  localUserId: number,
  topicNodeId: number
): Promise<boolean> {
  const row = await findEnrollment(localUserId, topicNodeId);
  return row !== undefined && row.status === "active";
}
