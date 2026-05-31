/**
 * Enrollment Query Functions
 *
 * Manages course topic access for students.
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "./connection";
import { enrollments, topics } from "@db/schema";

export async function findEnrollment(localUserId: number, topicId: number) {
  const rows = await getDb()
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

export async function getEnrollmentsByLocalUser(localUserId: number) {
  return getDb()
    .select({
      id: enrollments.id,
      localUserId: enrollments.localUserId,
      topicId: enrollments.topicId,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      expiresAt: enrollments.expiresAt,
      topicTitle: topics.title,
      topicSlug: topics.slug,
      topicColor: topics.color,
    })
    .from(enrollments)
    .innerJoin(topics, eq(enrollments.topicId, topics.id))
    .where(eq(enrollments.localUserId, localUserId));
}

export async function getActiveEnrollmentsByLocalUser(localUserId: number) {
  return getDb()
    .select({
      id: enrollments.id,
      topicId: enrollments.topicId,
      status: enrollments.status,
      topicTitle: topics.title,
      topicSlug: topics.slug,
    })
    .from(enrollments)
    .innerJoin(topics, eq(enrollments.topicId, topics.id))
    .where(
      and(
        eq(enrollments.localUserId, localUserId),
        eq(enrollments.status, "active")
      )
    );
}

export async function createEnrollment(data: {
  localUserId: number;
  topicId: number;
  createdBy: number;
}) {
  return getDb().insert(enrollments).values({
    localUserId: data.localUserId,
    topicId: data.topicId,
    status: "active",
    createdBy: data.createdBy,
  });
}

export async function updateEnrollmentStatus(
  id: number,
  status: "active" | "completed" | "suspended"
) {
  return getDb()
    .update(enrollments)
    .set({ status })
    .where(eq(enrollments.id, id));
}

export async function deleteEnrollment(id: number) {
  return getDb().delete(enrollments).where(eq(enrollments.id, id));
}

export async function isEnrolled(localUserId: number, topicId: number): Promise<boolean> {
  const row = await findEnrollment(localUserId, topicId);
  return row !== undefined && row.status === "active";
}
