/**
 * Enrollment Query Functions
 *
 * Manages course topic access for students.
 */

import { eq, and, inArray } from "drizzle-orm";
import { getLearningDb, getContentDb } from "./connection";
import { enrollments } from "@db/schema/learning";
import { topics } from "@db/schema/content";

// ── READ ──

export async function findEnrollment(localUserId: number, topicId: number) {
  const rows = await getLearningDb()
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.localUserId, localUserId),
        eq(enrollments.topicId, topicId)
      )
    )
    .limit(1);
  return rows.at(0);
}

async function loadTopicMap(topicIds: number[]) {
  if (topicIds.length === 0) return new Map<number, typeof topics.$inferSelect>();
  const rows = await getContentDb()
    .select()
    .from(topics)
    .where(inArray(topics.id, topicIds));
  return new Map(rows.map((t) => [t.id, t]));
}

export async function getEnrollmentsByLocalUser(localUserId: number) {
  const rows = await getLearningDb()
    .select()
    .from(enrollments)
    .where(eq(enrollments.localUserId, localUserId));

  const topicIds = rows.map((r) => r.topicId);
  const topicMap = await loadTopicMap(topicIds);

  return rows.map((row) => {
    const topic = topicMap.get(row.topicId);
    return {
      id: row.id,
      localUserId: row.localUserId,
      topicId: row.topicId,
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

  const topicIds = rows.map((r) => r.topicId);
  const topicMap = await loadTopicMap(topicIds);

  return rows.map((row) => {
    const topic = topicMap.get(row.topicId);
    return {
      id: row.id,
      localUserId: row.localUserId,
      topicId: row.topicId,
      status: row.status,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      comment: row.comment,
      currentSubtopicId: row.currentSubtopicId,
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

  const topicIds = rows.map((r) => r.topicId);
  const topicMap = await loadTopicMap(topicIds);

  return rows.map((row) => {
    const topic = topicMap.get(row.topicId);
    return {
      id: row.id,
      topicId: row.topicId,
      status: row.status,
      topicTitle: topic?.title ?? null,
      topicSlug: topic?.slug ?? null,
    };
  });
}

// ── CREATE ──

export async function createEnrollment(data: {
  localUserId: number;
  topicId: number;
  createdBy: number;
}) {
  return getLearningDb().insert(enrollments).values({
    localUserId: data.localUserId,
    topicId: data.topicId,
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
    currentSubtopicId?: number | null;
    comment?: string;
    startedAt?: Date | null;
    completedAt?: Date | null;
  }
) {
  const setData: Record<string, unknown> = {};
  if (data.status !== undefined) setData.status = data.status;
  if (data.currentSubtopicId !== undefined)
    setData.currentSubtopicId = data.currentSubtopicId;
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
  topicId: number
): Promise<boolean> {
  const row = await findEnrollment(localUserId, topicId);
  return row !== undefined && row.status === "active";
}
