/**
 * Assigned Jupyter Notebook Query Functions
 *
 * Manages Jupyter notebooks assigned to students by teachers.
 */

import { eq, and, asc, inArray } from "drizzle-orm";
import { getLearningDb, getJupyterDb, getContentDb } from "./connection";
import { assignedJupyterNotebooks } from "@db/schema/learning";
import { jupyterNotebooks } from "@db/schema/jupyter";
import { topicNodes } from "@db/schema/content";

export type AssignedJupyterNotebookWithDetails = Awaited<
  ReturnType<typeof getAssignedJupyterNotebooksByEnrollment>
>[number];

async function enrichNotebooks(
  rows: (typeof assignedJupyterNotebooks.$inferSelect)[]
) {
  const jupyterDb = getJupyterDb();
  const contentDb = getContentDb();

  const notebookIds = rows.map(r => r.notebookId);
  const notebooksMap = new Map<number, typeof jupyterNotebooks.$inferSelect>();

  if (notebookIds.length > 0) {
    const notebookRows = await jupyterDb
      .select()
      .from(jupyterNotebooks)
      .where(inArray(jupyterNotebooks.id, notebookIds));
    for (const n of notebookRows) notebooksMap.set(n.id, n);
  }

  const subtopicNodeIds = Array.from(
    new Set(Array.from(notebooksMap.values()).map(n => n.subtopicNodeId))
  );
  const subtopicMap = new Map<number, string>();
  if (subtopicNodeIds.length > 0) {
    const subtopicRows = await contentDb
      .select({ id: topicNodes.id, title: topicNodes.title })
      .from(topicNodes)
      .where(inArray(topicNodes.id, subtopicNodeIds));
    for (const s of subtopicRows) subtopicMap.set(s.id, s.title);
  }

  return rows.map(row => {
    const notebook = notebooksMap.get(row.notebookId);
    return {
      id: row.id,
      enrollmentId: row.enrollmentId,
      localUserId: row.localUserId,
      notebookId: row.notebookId,
      order: row.order,
      status: row.status,
      grade: row.grade,
      studentColabUrl: row.studentColabUrl,
      teacherComment: row.teacherComment,
      assignedBy: row.assignedBy,
      assignedAt: row.assignedAt,
      submittedAt: row.submittedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      notebookTitle: notebook?.title ?? "—",
      notebookFilename: notebook?.filename ?? "",
      notebookFilePath: notebook?.filePath ?? "",
      subtopicTitle: subtopicMap.get(notebook?.subtopicNodeId ?? 0) ?? "—",
    };
  });
}

export async function getAssignedJupyterNotebooksByEnrollment(
  enrollmentId: number
) {
  const learningDb = getLearningDb();

  const rows = await learningDb
    .select()
    .from(assignedJupyterNotebooks)
    .where(eq(assignedJupyterNotebooks.enrollmentId, enrollmentId))
    .orderBy(asc(assignedJupyterNotebooks.order));

  return enrichNotebooks(rows);
}

export async function getAssignedJupyterNotebookById(id: number) {
  const learningDb = getLearningDb();

  const rows = await learningDb
    .select()
    .from(assignedJupyterNotebooks)
    .where(eq(assignedJupyterNotebooks.id, id))
    .limit(1);

  const row = rows.at(0);
  if (!row) return null;

  const enriched = await enrichNotebooks([row]);
  return enriched[0];
}

export async function getAssignedJupyterNotebooksByStudent(
  localUserId: number
) {
  const learningDb = getLearningDb();

  const rows = await learningDb
    .select()
    .from(assignedJupyterNotebooks)
    .where(eq(assignedJupyterNotebooks.localUserId, localUserId))
    .orderBy(asc(assignedJupyterNotebooks.order));

  return enrichNotebooks(rows);
}

export async function findAssignedJupyterNotebook(
  enrollmentId: number,
  notebookId: number
) {
  const rows = await getLearningDb()
    .select()
    .from(assignedJupyterNotebooks)
    .where(
      and(
        eq(assignedJupyterNotebooks.enrollmentId, enrollmentId),
        eq(assignedJupyterNotebooks.notebookId, notebookId)
      )
    )
    .limit(1);
  return rows.at(0);
}

export async function createAssignedJupyterNotebook(data: {
  enrollmentId: number;
  localUserId: number;
  notebookId: number;
  order: number;
  assignedBy: number;
}) {
  return getLearningDb().insert(assignedJupyterNotebooks).values({
    enrollmentId: data.enrollmentId,
    localUserId: data.localUserId,
    notebookId: data.notebookId,
    order: data.order,
    assignedBy: data.assignedBy,
  });
}

export async function updateAssignedJupyterNotebook(
  id: number,
  data: {
    status?: "assigned" | "submitted" | "completed";
    grade?: number | null;
    studentColabUrl?: string | null;
    submittedAt?: Date | null;
    teacherComment?: string | null;
    completedAt?: Date | null;
  }
) {
  const setData: Record<string, unknown> = {};
  if (data.status !== undefined) setData.status = data.status;
  if (data.grade !== undefined) setData.grade = data.grade;
  if (data.studentColabUrl !== undefined)
    setData.studentColabUrl = data.studentColabUrl;
  if (data.submittedAt !== undefined) setData.submittedAt = data.submittedAt;
  if (data.teacherComment !== undefined)
    setData.teacherComment = data.teacherComment;
  if (data.completedAt !== undefined) setData.completedAt = data.completedAt;

  return getLearningDb()
    .update(assignedJupyterNotebooks)
    .set(setData)
    .where(eq(assignedJupyterNotebooks.id, id));
}

export async function deleteAssignedJupyterNotebook(id: number) {
  return getLearningDb()
    .delete(assignedJupyterNotebooks)
    .where(eq(assignedJupyterNotebooks.id, id));
}

export async function getMaxOrderForJupyterNotebooks(enrollmentId: number) {
  const rows = await getLearningDb()
    .select({ maxOrder: assignedJupyterNotebooks.order })
    .from(assignedJupyterNotebooks)
    .where(eq(assignedJupyterNotebooks.enrollmentId, enrollmentId))
    .orderBy(asc(assignedJupyterNotebooks.order));

  return rows.at(rows.length - 1)?.maxOrder ?? 0;
}
