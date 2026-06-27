/**
 * Assigned Lab Works Query Functions
 *
 * Manages lab works assigned to students by teachers.
 */

import { eq, and, asc, inArray } from "drizzle-orm";
import { getLearningDb, getLabsDb } from "./connection";
import { assignedLabWorks } from "@db/schema/learning";
import { labWorks } from "@db/schema/labs";

export type AssignedLabWorkWithDetails = Awaited<
  ReturnType<typeof getAssignedLabWorksByEnrollment>
>[number];

export async function getAssignedLabWorksByEnrollment(enrollmentId: number) {
  const learningDb = getLearningDb();
  const labsDb = getLabsDb();

  const rows = await learningDb
    .select()
    .from(assignedLabWorks)
    .where(eq(assignedLabWorks.enrollmentId, enrollmentId))
    .orderBy(asc(assignedLabWorks.order));

  const labWorkIds = rows.map(r => r.labWorkId);
  const labWorksMap = new Map<number, typeof labWorks.$inferSelect>();

  if (labWorkIds.length > 0) {
    const works = await labsDb
      .select()
      .from(labWorks)
      .where(inArray(labWorks.id, labWorkIds));
    for (const w of works) labWorksMap.set(w.id, w);
  }

  return rows.map(row => {
    const work = labWorksMap.get(row.labWorkId);
    return {
      id: row.id,
      enrollmentId: row.enrollmentId,
      localUserId: row.localUserId,
      labWorkId: row.labWorkId,
      order: row.order,
      status: row.status,
      grade: row.grade,
      assignedBy: row.assignedBy,
      assignedAt: row.assignedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      labTitle: work?.title ?? "—",
      labSlug: work?.slug ?? "",
      labGoal: work?.goal ?? null,
    };
  });
}

export async function getAssignedLabWorksByStudent(localUserId: number) {
  const learningDb = getLearningDb();
  const labsDb = getLabsDb();

  const rows = await learningDb
    .select()
    .from(assignedLabWorks)
    .where(eq(assignedLabWorks.localUserId, localUserId))
    .orderBy(asc(assignedLabWorks.order));

  const labWorkIds = rows.map(r => r.labWorkId);
  const labWorksMap = new Map<number, typeof labWorks.$inferSelect>();

  if (labWorkIds.length > 0) {
    const works = await labsDb
      .select()
      .from(labWorks)
      .where(inArray(labWorks.id, labWorkIds));
    for (const w of works) labWorksMap.set(w.id, w);
  }

  return rows.map(row => {
    const work = labWorksMap.get(row.labWorkId);
    return {
      id: row.id,
      enrollmentId: row.enrollmentId,
      localUserId: row.localUserId,
      labWorkId: row.labWorkId,
      order: row.order,
      status: row.status,
      grade: row.grade,
      assignedBy: row.assignedBy,
      assignedAt: row.assignedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      labTitle: work?.title ?? "—",
      labSlug: work?.slug ?? "",
      labGoal: work?.goal ?? null,
    };
  });
}

export async function findAssignedLabWork(
  enrollmentId: number,
  labWorkId: number
) {
  const rows = await getLearningDb()
    .select()
    .from(assignedLabWorks)
    .where(
      and(
        eq(assignedLabWorks.enrollmentId, enrollmentId),
        eq(assignedLabWorks.labWorkId, labWorkId)
      )
    )
    .limit(1);
  return rows.at(0);
}

export async function createAssignedLabWork(data: {
  enrollmentId: number;
  localUserId: number;
  labWorkId: number;
  order: number;
  assignedBy: number;
}) {
  return getLearningDb().insert(assignedLabWorks).values({
    enrollmentId: data.enrollmentId,
    localUserId: data.localUserId,
    labWorkId: data.labWorkId,
    order: data.order,
    assignedBy: data.assignedBy,
  });
}

export async function updateAssignedLabWork(
  id: number,
  data: {
    status?: "assigned" | "completed";
    grade?: number | null;
    completedAt?: Date | null;
  }
) {
  const setData: Record<string, unknown> = {};
  if (data.status !== undefined) setData.status = data.status;
  if (data.grade !== undefined) setData.grade = data.grade;
  if (data.completedAt !== undefined) setData.completedAt = data.completedAt;

  return getLearningDb()
    .update(assignedLabWorks)
    .set(setData)
    .where(eq(assignedLabWorks.id, id));
}

export async function deleteAssignedLabWork(id: number) {
  return getLearningDb()
    .delete(assignedLabWorks)
    .where(eq(assignedLabWorks.id, id));
}

export async function getMaxOrderForEnrollment(enrollmentId: number) {
  const rows = await getLearningDb()
    .select({ maxOrder: assignedLabWorks.order })
    .from(assignedLabWorks)
    .where(eq(assignedLabWorks.enrollmentId, enrollmentId))
    .orderBy(asc(assignedLabWorks.order));

  return rows.at(rows.length - 1)?.maxOrder ?? 0;
}
