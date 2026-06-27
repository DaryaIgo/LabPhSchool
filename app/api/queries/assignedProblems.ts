/**
 * Assigned Problems Query Functions
 *
 * Manages problems assigned to students by teachers.
 */

import { eq, and, asc, inArray } from "drizzle-orm";
import { getLearningDb, getProblemsDb } from "./connection";
import { assignedProblems } from "@db/schema/learning";
import { problems } from "@db/schema/problems";

export type AssignedProblemWithDetails = Awaited<
  ReturnType<typeof getAssignedProblemsByEnrollment>
>[number];

export async function getAssignedProblemsByEnrollment(enrollmentId: number) {
  const learningDb = getLearningDb();
  const problemsDb = getProblemsDb();

  const rows = await learningDb
    .select()
    .from(assignedProblems)
    .where(eq(assignedProblems.enrollmentId, enrollmentId))
    .orderBy(asc(assignedProblems.order));

  const problemIds = rows.map(r => r.problemId);
  const problemsMap = new Map<number, typeof problems.$inferSelect>();

  if (problemIds.length > 0) {
    const problemRows = await problemsDb
      .select()
      .from(problems)
      .where(inArray(problems.id, problemIds));
    for (const p of problemRows) problemsMap.set(p.id, p);
  }

  return rows.map(row => {
    const problem = problemsMap.get(row.problemId);
    return {
      id: row.id,
      enrollmentId: row.enrollmentId,
      localUserId: row.localUserId,
      problemId: row.problemId,
      order: row.order,
      status: row.status,
      grade: row.grade,
      assignedBy: row.assignedBy,
      assignedAt: row.assignedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      problemTitle: problem?.title ?? "—",
      problemSlug: problem?.slug ?? "",
      problemDifficulty: problem?.difficulty ?? null,
    };
  });
}

export async function getAssignedProblemsByStudent(localUserId: number) {
  const learningDb = getLearningDb();
  const problemsDb = getProblemsDb();

  const rows = await learningDb
    .select()
    .from(assignedProblems)
    .where(eq(assignedProblems.localUserId, localUserId))
    .orderBy(asc(assignedProblems.order));

  const problemIds = rows.map(r => r.problemId);
  const problemsMap = new Map<number, typeof problems.$inferSelect>();

  if (problemIds.length > 0) {
    const problemRows = await problemsDb
      .select()
      .from(problems)
      .where(inArray(problems.id, problemIds));
    for (const p of problemRows) problemsMap.set(p.id, p);
  }

  return rows.map(row => {
    const problem = problemsMap.get(row.problemId);
    return {
      id: row.id,
      enrollmentId: row.enrollmentId,
      localUserId: row.localUserId,
      problemId: row.problemId,
      order: row.order,
      status: row.status,
      grade: row.grade,
      assignedBy: row.assignedBy,
      assignedAt: row.assignedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      problemTitle: problem?.title ?? "—",
      problemSlug: problem?.slug ?? "",
      problemDifficulty: problem?.difficulty ?? null,
    };
  });
}

export async function findAssignedProblem(
  enrollmentId: number,
  problemId: number
) {
  const rows = await getLearningDb()
    .select()
    .from(assignedProblems)
    .where(
      and(
        eq(assignedProblems.enrollmentId, enrollmentId),
        eq(assignedProblems.problemId, problemId)
      )
    )
    .limit(1);
  return rows.at(0);
}

export async function createAssignedProblem(data: {
  enrollmentId: number;
  localUserId: number;
  problemId: number;
  order: number;
  assignedBy: number;
}) {
  return getLearningDb().insert(assignedProblems).values({
    enrollmentId: data.enrollmentId,
    localUserId: data.localUserId,
    problemId: data.problemId,
    order: data.order,
    assignedBy: data.assignedBy,
  });
}

export async function updateAssignedProblem(
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
    .update(assignedProblems)
    .set(setData)
    .where(eq(assignedProblems.id, id));
}

export async function deleteAssignedProblem(id: number) {
  return getLearningDb()
    .delete(assignedProblems)
    .where(eq(assignedProblems.id, id));
}

export async function getMaxOrderForProblems(enrollmentId: number) {
  const rows = await getLearningDb()
    .select({ maxOrder: assignedProblems.order })
    .from(assignedProblems)
    .where(eq(assignedProblems.enrollmentId, enrollmentId))
    .orderBy(asc(assignedProblems.order));

  return rows.at(rows.length - 1)?.maxOrder ?? 0;
}
