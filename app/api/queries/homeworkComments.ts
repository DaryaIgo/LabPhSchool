import { getAssignedLabWorksByStudent } from "./assignedLabWorks";
import { getAssignedProblemsByStudent } from "./assignedProblems";

export type HomeworkCommentItem = {
  id: number;
  type: "problem" | "lab";
  title: string;
  slug: string;
  completedAt: Date;
  teacherComment: string;
};

export async function getHomeworkCommentsByStudent(
  localUserId: number
): Promise<HomeworkCommentItem[]> {
  const [problems, labs] = await Promise.all([
    getAssignedProblemsByStudent(localUserId),
    getAssignedLabWorksByStudent(localUserId),
  ]);

  const problemComments = problems
    .filter(p => Boolean(p.teacherComment?.trim()) && p.completedAt)
    .map(p => ({
      id: p.id,
      type: "problem" as const,
      title: p.problemTitle,
      slug: p.problemSlug,
      completedAt: p.completedAt!,
      teacherComment: p.teacherComment!,
    }));

  const labComments = labs
    .filter(l => Boolean(l.teacherComment?.trim()) && l.completedAt)
    .map(l => ({
      id: l.id,
      type: "lab" as const,
      title: l.labTitle,
      slug: l.labSlug,
      completedAt: l.completedAt!,
      teacherComment: l.teacherComment!,
    }));

  const combined = [...problemComments, ...labComments];
  combined.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return combined.slice(0, 50);
}
