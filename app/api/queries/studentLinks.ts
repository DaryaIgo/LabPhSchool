/**
 * Student Personal Links Query Functions
 *
 * CRUD for teacher-assigned personal links (Zoom, Telemost, etc.)
 * attached directly to a student (local_user).
 */

import { eq, asc, desc } from "drizzle-orm";
import { getLearningDb } from "./connection";
import { studentLinks } from "@db/schema/learning";

export type StudentLinkWithPlatform = Awaited<
  ReturnType<typeof listStudentLinks>
>[number];

export async function listStudentLinks(localUserId: number) {
  const learningDb = getLearningDb();

  const rows = await learningDb
    .select()
    .from(studentLinks)
    .where(eq(studentLinks.localUserId, localUserId))
    .orderBy(asc(studentLinks.displayOrder), desc(studentLinks.createdAt));

  return rows;
}

export async function getStudentLinkById(id: number) {
  const learningDb = getLearningDb();

  const rows = await learningDb
    .select()
    .from(studentLinks)
    .where(eq(studentLinks.id, id))
    .limit(1);

  return rows.at(0) ?? null;
}

export async function getMaxDisplayOrder(localUserId: number) {
  const learningDb = getLearningDb();

  const rows = await learningDb
    .select({ maxOrder: studentLinks.displayOrder })
    .from(studentLinks)
    .where(eq(studentLinks.localUserId, localUserId))
    .orderBy(desc(studentLinks.displayOrder))
    .limit(1);

  return rows.at(0)?.maxOrder ?? 0;
}

interface CreateStudentLinkInput {
  localUserId: number;
  url: string;
  title?: string | null;
  platformKey: string;
  displayOrder: number;
  createdBy?: number | null;
}

export async function createStudentLink(input: CreateStudentLinkInput) {
  const learningDb = getLearningDb();

  return learningDb.insert(studentLinks).values({
    localUserId: input.localUserId,
    url: input.url,
    title: input.title,
    platformKey: input.platformKey,
    displayOrder: input.displayOrder,
    createdBy: input.createdBy,
  });
}

interface UpdateStudentLinkInput {
  url?: string;
  title?: string | null;
  platformKey?: string;
  displayOrder?: number;
}

export async function updateStudentLink(
  id: number,
  input: UpdateStudentLinkInput
) {
  const learningDb = getLearningDb();

  return learningDb
    .update(studentLinks)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(studentLinks.id, id));
}

export async function deleteStudentLink(id: number) {
  const learningDb = getLearningDb();

  return learningDb.delete(studentLinks).where(eq(studentLinks.id, id));
}

export async function deleteStudentLinksByLocalUserId(localUserId: number) {
  const learningDb = getLearningDb();

  return learningDb
    .delete(studentLinks)
    .where(eq(studentLinks.localUserId, localUserId));
}
