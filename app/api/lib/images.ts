import { getLearningDb, getMediaDb } from "../queries/connection";
import { assignedProblems } from "@db/schema/learning";
import { images } from "@db/schema/media";
import { eq, lte, isNotNull, and, like } from "drizzle-orm";

const MS_IN_24_HOURS = 24 * 60 * 60 * 1000;

export function getSolutionImageDeleteAt(): Date {
  return new Date(Date.now() + MS_IN_24_HOURS);
}

function parseImageIdFromUrl(url: string): number | null {
  const match = url.match(/^\/uploads\/(\d+)\//);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

async function deleteImageAndClearAssignment(
  imageId: number,
  assignmentId: number
): Promise<void> {
  const learningDb = getLearningDb();
  const mediaDb = getMediaDb();

  try {
    await mediaDb.delete(images).where(eq(images.id, imageId));
  } catch (err) {
    console.error(`Failed to delete solution image ${imageId}:`, err);
  }

  await learningDb
    .update(assignedProblems)
    .set({
      solutionImageUrl: null,
      solutionImageDeleteAt: null,
    })
    .where(eq(assignedProblems.id, assignmentId));
}

/**
 * Deletes solution images whose 24-hour retention period has expired.
 *
 * - If `assignedProblemId` is provided, checks that single row.
 * - If `imageId` is provided, limits cleanup to rows referencing that image.
 */
export async function cleanupExpiredSolutionImages(options?: {
  imageId?: number;
  assignedProblemId?: number;
}): Promise<void> {
  const learningDb = getLearningDb();
  const now = new Date();

  if (options?.assignedProblemId !== undefined) {
    const [row] = await learningDb
      .select({
        id: assignedProblems.id,
        solutionImageUrl: assignedProblems.solutionImageUrl,
        solutionImageDeleteAt: assignedProblems.solutionImageDeleteAt,
      })
      .from(assignedProblems)
      .where(eq(assignedProblems.id, options.assignedProblemId))
      .limit(1);

    if (!row?.solutionImageUrl || !row.solutionImageDeleteAt) {
      return;
    }

    if (row.solutionImageDeleteAt.getTime() > now.getTime()) {
      return;
    }

    const imageId = parseImageIdFromUrl(row.solutionImageUrl);
    if (!imageId) return;
    if (options.imageId !== undefined && imageId !== options.imageId) return;

    await deleteImageAndClearAssignment(imageId, row.id);
    return;
  }

  const conditions = [
    isNotNull(assignedProblems.solutionImageUrl),
    isNotNull(assignedProblems.solutionImageDeleteAt),
    lte(assignedProblems.solutionImageDeleteAt, now),
  ];

  if (options?.imageId !== undefined) {
    conditions.push(
      like(assignedProblems.solutionImageUrl, `%/uploads/${options.imageId}/%`)
    );
  }

  const rows = await learningDb
    .select({
      id: assignedProblems.id,
      solutionImageUrl: assignedProblems.solutionImageUrl,
    })
    .from(assignedProblems)
    .where(and(...conditions));

  for (const row of rows) {
    const imageId = parseImageIdFromUrl(row.solutionImageUrl!);
    if (!imageId) continue;
    await deleteImageAndClearAssignment(imageId, row.id);
  }
}
