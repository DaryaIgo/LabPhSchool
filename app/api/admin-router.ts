/**
 * Admin Router — CMS & User Management
 *
 * All endpoints require adminQuery middleware (admin role).
 * Operations are protected by RBAC and logged to audit_log.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import {
  getAuthDb,
  getContentDb,
  getLearningDb,
  getLabsDb,
  getProblemsDb,
  getJupyterDb,
  getNotificationsDb,
  getMediaDb,
} from "./queries/connection";
import { topicNodes, resources } from "@db/schema/content";
import { labWorks } from "@db/schema/labs";
import { labProgress, assignedProblems } from "@db/schema/learning";
import { problems } from "@db/schema/problems";
import { localUsers, roles } from "@db/schema/auth";
import { jupyterNotebooks, jupyterNotebookAccess } from "@db/schema/jupyter";
import { notifications } from "@db/schema/notifications";
import { images } from "@db/schema/media";
import { eq, asc, desc, count, and, inArray, isNull } from "drizzle-orm";
import { createAuditEntry } from "./queries/audit";
import {
  findAssignedLabWorkByProgress,
  updateAssignedLabWork,
} from "./queries/assignedLabWorks";

export const adminRouter = createRouter({
  // ═══════════════════════════════════════════════════════════
  // Dashboard Statistics
  // ═══════════════════════════════════════════════════════════

  dashboardStats: adminQuery.query(async () => {
    const authDb = getAuthDb();
    const contentDb = getContentDb();
    const labsDb = getLabsDb();
    const learningDb = getLearningDb();

    const [studentCount] = await authDb
      .select({ count: count() })
      .from(localUsers)
      .innerJoin(roles, eq(localUsers.roleId, roles.id))
      .where(eq(roles.name, "student"));
    const [activeCount] = await authDb
      .select({ count: count() })
      .from(localUsers)
      .innerJoin(roles, eq(localUsers.roleId, roles.id))
      .where(and(eq(roles.name, "student"), eq(localUsers.status, "active")));
    const [suspendedCount] = await authDb
      .select({ count: count() })
      .from(localUsers)
      .innerJoin(roles, eq(localUsers.roleId, roles.id))
      .where(
        and(eq(roles.name, "student"), eq(localUsers.status, "suspended"))
      );
    const [topicCount] = await contentDb
      .select({ count: count() })
      .from(topicNodes)
      .where(isNull(topicNodes.parentId));
    const [labWorkCount] = await labsDb
      .select({ count: count() })
      .from(labWorks);
    const [resourceCount] = await contentDb
      .select({ count: count() })
      .from(resources);
    const [labSubmissionCount] = await learningDb
      .select({ count: count() })
      .from(labProgress)
      .where(eq(labProgress.status, "submitted"));

    const [problemSubmissionCount] = await learningDb
      .select({ count: count() })
      .from(assignedProblems)
      .where(eq(assignedProblems.status, "submitted"));

    return {
      students: {
        total: studentCount.count,
        active: activeCount.count,
        suspended: suspendedCount.count,
      },
      content: {
        topics: topicCount.count,
        labWorks: labWorkCount.count,
        resources: resourceCount.count,
        submissions:
          labSubmissionCount.count + problemSubmissionCount.count,
      },
    };
  }),

  // ═══════════════════════════════════════════════════════════
  // TOPIC NODES CRUD (hierarchical markdown topics)
  // ═══════════════════════════════════════════════════════════

  listTopicNodes: adminQuery.query(async () => {
    return getContentDb()
      .select()
      .from(topicNodes)
      .orderBy(asc(topicNodes.order));
  }),

  getTopicNode: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      const db = getContentDb();
      const node = await db
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.id, input.id))
        .limit(1);
      if (!node[0]) return null;
      const children = await db
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.parentId, input.id))
        .orderBy(asc(topicNodes.order));
      return { ...node[0], children };
    }),

  createTopicNode: adminQuery
    .input(
      z.object({
        parentId: z.number().positive().optional(),
        order: z.number().int().min(1).default(1),
        title: z.string().min(1).max(255),
        slug: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[a-z0-9-]+$/),
        content: z.string().max(100000).optional(),
        color: z.string().max(20).optional(),
        jupyterUrl: z.string().max(500).optional().nullable(),
        labCategorySlug: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getContentDb();
      const result = await db.insert(topicNodes).values({
        parentId: input.parentId ?? null,
        order: input.order,
        title: input.title,
        slug: input.slug,
        content: input.content ?? null,
        color: input.color ?? null,
        jupyterUrl: input.jupyterUrl ?? null,
        labCategorySlug: input.labCategorySlug ?? null,
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "topic_nodes",
        resourceId: id,
        details: {
          title: input.title,
          slug: input.slug,
          parentId: input.parentId,
        },
      });
      return { id, success: true };
    }),

  updateTopicNode: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        parentId: z.number().positive().optional().nullable(),
        order: z.number().int().min(1).optional(),
        title: z.string().min(1).max(255).optional(),
        slug: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[a-z0-9-]+$/)
          .optional(),
        content: z.string().max(100000).optional(),
        color: z.string().max(20).optional(),
        jupyterUrl: z.string().max(500).optional().nullable(),
        labCategorySlug: z.string().max(255).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getContentDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.parentId !== undefined) updateData.parentId = data.parentId;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.jupyterUrl !== undefined)
        updateData.jupyterUrl = data.jupyterUrl;
      if (data.labCategorySlug !== undefined)
        updateData.labCategorySlug = data.labCategorySlug;

      await db.update(topicNodes).set(updateData).where(eq(topicNodes.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "topic_nodes",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  deleteTopicNode: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getContentDb();
      const allNodes = await db
        .select({ id: topicNodes.id, parentId: topicNodes.parentId })
        .from(topicNodes);
      const childrenMap = new Map<number, number[]>();
      for (const n of allNodes) {
        if (n.parentId) {
          const arr = childrenMap.get(n.parentId) ?? [];
          arr.push(n.id);
          childrenMap.set(n.parentId, arr);
        }
      }
      const toDelete: number[] = [];
      const collect = (nodeId: number) => {
        toDelete.push(nodeId);
        const children = childrenMap.get(nodeId) ?? [];
        for (const childId of children) collect(childId);
      };
      collect(input.id);
      // Delete leaves first to avoid FK constraint violations
      for (let i = toDelete.length - 1; i >= 0; i--) {
        await db.delete(topicNodes).where(eq(topicNodes.id, toDelete[i]));
      }

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "topic_nodes",
        resourceId: input.id,
        details: { deletedCount: toDelete.length },
      });

      return { success: true, deletedCount: toDelete.length };
    }),

  importTopicNode: adminQuery
    .input(
      z.object({
        parentId: z.number().positive().optional(),
        markdown: z.string().min(1).max(200000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { default: matter } = await import("gray-matter");
      const parsed = matter(input.markdown);
      const front = parsed.data as Record<string, unknown>;

      const title = String(front.title ?? "");
      const slug = String(front.slug ?? "");
      if (!title || !slug) {
        throw new Error("Front matter must include 'title' and 'slug'");
      }

      const db = getContentDb();
      const result = await db.insert(topicNodes).values({
        parentId: input.parentId ?? null,
        order: Number(front.order ?? 1),
        title,
        slug,
        content: parsed.content || null,
        color: front.color ? String(front.color) : null,
      });
      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "topic_nodes",
        resourceId: id,
        details: { title, slug, source: "import" },
      });

      return { id, success: true };
    }),

  exportTopicNode: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      const db = getContentDb();
      const node = await db
        .select()
        .from(topicNodes)
        .where(eq(topicNodes.id, input.id))
        .limit(1);
      if (!node[0]) return null;
      const n = node[0];
      const frontMatter = [
        "---",
        `title: "${n.title}"`,
        `slug: ${n.slug}`,
        `order: ${n.order}`,
        n.color ? `color: "${n.color}"` : null,
        "---",
        "",
        n.content ?? "",
      ]
        .filter(Boolean)
        .join("\n");
      return { markdown: frontMatter, filename: `${n.slug}.md` };
    }),

  // ═══════════════════════════════════════════════════════════
  // RESOURCES CRUD
  // ═══════════════════════════════════════════════════════════

  listResources: adminQuery.query(async () => {
    return getContentDb().select().from(resources).orderBy(asc(resources.id));
  }),

  createResource: adminQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(5000).optional(),
        type: z.enum(["video", "reference", "workbook", "model"]),
        url: z.string().max(500).optional(),
        tags: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getContentDb();
      const result = await db.insert(resources).values({
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        url: input.url ?? null,
        tags: input.tags ?? null,
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "resources",
        resourceId: id,
        details: { title: input.title, type: input.type },
      });

      return { id, success: true };
    }),

  updateResource: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        type: z.enum(["video", "reference", "workbook", "model"]).optional(),
        url: z.string().max(500).optional(),
        tags: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getContentDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.tags !== undefined) updateData.tags = data.tags;

      await db.update(resources).set(updateData).where(eq(resources.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "resources",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  deleteResource: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getContentDb().delete(resources).where(eq(resources.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "resources",
        resourceId: input.id,
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // Submissions Review (labs + problems)
  // ═══════════════════════════════════════════════════════════

  getSubmissions: adminQuery
    .input(
      z
        .object({
          status: z.enum(["submitted", "completed"]).optional(),
          type: z.enum(["lab", "problem", "all"]).default("all"),
          studentId: z.number().positive().optional(),
          search: z.string().optional(),
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const learningDb = getLearningDb();
      const authDb = getAuthDb();
      const labsDb = getLabsDb();
      const problemsDb = getProblemsDb();

      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;
      const status = input?.status ?? "submitted";
      const type = input?.type ?? "all";
      const studentId = input?.studentId;
      const search = input?.search?.toLowerCase();

      // Fetch lab submissions
      const labConditions = [
        eq(labProgress.status, status as "submitted" | "completed"),
      ];
      if (studentId) {
        labConditions.push(eq(labProgress.localUserId, studentId));
      }

      const labRows =
        type === "problem"
          ? []
          : await learningDb
              .select()
              .from(labProgress)
              .where(and(...labConditions))
              .orderBy(desc(labProgress.updatedAt));

      // Fetch problem submissions
      const problemConditions = [
        eq(assignedProblems.status, status as "submitted" | "completed"),
      ];
      if (studentId) {
        problemConditions.push(eq(assignedProblems.localUserId, studentId));
      }

      const problemRows =
        type === "lab"
          ? []
          : await learningDb
              .select()
              .from(assignedProblems)
              .where(and(...problemConditions))
              .orderBy(desc(assignedProblems.updatedAt));

      // Load related data
      const studentIds = new Set<number>();
      for (const r of labRows) studentIds.add(r.localUserId);
      for (const r of problemRows) studentIds.add(r.localUserId);

      const studentMap = new Map<number, typeof localUsers.$inferSelect>();
      if (studentIds.size > 0) {
        const students = await authDb
          .select()
          .from(localUsers)
          .where(inArray(localUsers.id, Array.from(studentIds)));
        for (const s of students) studentMap.set(s.id, s);
      }

      const labWorkIds = labRows.map(r => r.labWorkId);
      const labWorkMap = new Map<number, typeof labWorks.$inferSelect>();
      if (labWorkIds.length > 0) {
        const works = await labsDb
          .select()
          .from(labWorks)
          .where(inArray(labWorks.id, labWorkIds));
        for (const w of works) labWorkMap.set(w.id, w);
      }

      const problemIds = problemRows.map(r => r.problemId);
      const problemMap = new Map<number, typeof problems.$inferSelect>();
      if (problemIds.length > 0) {
        const problemRowsDb = await problemsDb
          .select()
          .from(problems)
          .where(inArray(problems.id, problemIds));
        for (const p of problemRowsDb) problemMap.set(p.id, p);
      }

      // Build combined items
      const labItems = labRows.map(p => {
        const student = studentMap.get(p.localUserId);
        const work = labWorkMap.get(p.labWorkId);
        return {
          type: "lab" as const,
          id: p.id,
          status: p.status,
          grade: p.grade,
          teacherComment: p.teacherComment,
          startedAt: p.startedAt,
          completedAt: p.completedAt,
          updatedAt: p.updatedAt,
          studentId: p.localUserId,
          studentName: student?.name ?? "—",
          studentLogin: student?.login ?? "—",
          labWorkId: p.labWorkId,
          labWorkTitle: work?.title ?? "—",
          labWorkSlug: work?.slug ?? "—",
        };
      });

      const problemItems = problemRows.map(p => {
        const student = studentMap.get(p.localUserId);
        const problem = problemMap.get(p.problemId);
        return {
          type: "problem" as const,
          id: p.id,
          status: p.status,
          grade: p.grade,
          teacherComment: p.teacherComment,
          submittedAt: p.submittedAt,
          completedAt: p.completedAt,
          updatedAt: p.updatedAt,
          studentId: p.localUserId,
          studentName: student?.name ?? "—",
          studentLogin: student?.login ?? "—",
          problemId: p.problemId,
          problemTitle: problem?.title ?? "—",
          problemSlug: problem?.slug ?? "—",
        };
      });

      let combined = [...labItems, ...problemItems].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      if (search) {
        combined = combined.filter(item => {
          const title =
            item.type === "lab" ? item.labWorkTitle : item.problemTitle;
          return (
            title.toLowerCase().includes(search) ||
            item.studentName.toLowerCase().includes(search) ||
            item.studentLogin.toLowerCase().includes(search)
          );
        });
      }

      const total = combined.length;
      const offset = (page - 1) * pageSize;
      const items = combined.slice(offset, offset + pageSize);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  getSubmissionById: adminQuery
    .input(
      z.object({
        type: z.enum(["lab", "problem"]),
        id: z.number().positive(),
      })
    )
    .query(async ({ input }) => {
      const learningDb = getLearningDb();
      const authDb = getAuthDb();
      const labsDb = getLabsDb();
      const problemsDb = getProblemsDb();

      if (input.type === "lab") {
        const [progressRow] = await learningDb
          .select()
          .from(labProgress)
          .where(eq(labProgress.id, input.id));

        if (!progressRow) {
          throw new Error("Submission not found");
        }

        const [student] = await authDb
          .select()
          .from(localUsers)
          .where(eq(localUsers.id, progressRow.localUserId))
          .limit(1);

        const [work] = await labsDb
          .select()
          .from(labWorks)
          .where(eq(labWorks.id, progressRow.labWorkId))
          .limit(1);

        return {
          type: "lab" as const,
          id: progressRow.id,
          status: progressRow.status,
          mode: progressRow.mode,
          data: progressRow.data,
          measurements: progressRow.measurements,
          conclusion: progressRow.conclusion,
          grade: progressRow.grade,
          teacherComment: progressRow.teacherComment,
          startedAt: progressRow.startedAt,
          completedAt: progressRow.completedAt,
          updatedAt: progressRow.updatedAt,
          studentId: progressRow.localUserId,
          studentName: student?.name ?? "—",
          studentLogin: student?.login ?? "—",
          labWorkId: progressRow.labWorkId,
          labWorkTitle: work?.title ?? "—",
          labWorkSlug: work?.slug ?? "—",
          labWorkGoal: work?.goal ?? null,
          labWorkTheory: work?.theory ?? null,
        };
      }

      const [assignment] = await learningDb
        .select()
        .from(assignedProblems)
        .where(eq(assignedProblems.id, input.id));

      if (!assignment) {
        throw new Error("Submission not found");
      }

      const [student] = await authDb
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, assignment.localUserId))
        .limit(1);

      const [problem] = await problemsDb
        .select()
        .from(problems)
        .where(eq(problems.id, assignment.problemId))
        .limit(1);

      return {
        type: "problem" as const,
        id: assignment.id,
        status: assignment.status,
        grade: assignment.grade,
        studentAnswer: assignment.studentAnswer,
        solutionImageUrl: assignment.solutionImageUrl,
        submittedAt: assignment.submittedAt,
        teacherComment: assignment.teacherComment,
        completedAt: assignment.completedAt,
        updatedAt: assignment.updatedAt,
        studentId: assignment.localUserId,
        studentName: student?.name ?? "—",
        studentLogin: student?.login ?? "—",
        problemId: assignment.problemId,
        problemTitle: problem?.title ?? "—",
        problemSlug: problem?.slug ?? "—",
        problemCondition: problem?.condition ?? "",
        problemAnswer: problem?.answer ?? "",
        problemSolution: problem?.solution ?? "",
      };
    }),

  gradeSubmission: adminQuery
    .input(
      z.object({
        type: z.enum(["lab", "problem"]),
        id: z.number().positive(),
        grade: z.number().min(1).max(5).optional(),
        teacherComment: z.string().max(2000).optional(),
        status: z.enum(["submitted", "completed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const learningDb = getLearningDb();
      const now = new Date();

      if (input.type === "lab") {
        const updateData: Record<string, unknown> = {
          updatedAt: now,
        };
        if (input.grade !== undefined) updateData.grade = input.grade;
        if (input.teacherComment !== undefined)
          updateData.teacherComment = input.teacherComment;
        if (input.status !== undefined) {
          updateData.status = input.status;
          if (input.status === "completed") {
            updateData.completedAt = now;
          }
        }

        await learningDb
          .update(labProgress)
          .set(updateData)
          .where(eq(labProgress.id, input.id));

        // Sync grade/status into assigned_lab_works
        const [progressRow] = await learningDb
          .select()
          .from(labProgress)
          .where(eq(labProgress.id, input.id))
          .limit(1);

        if (progressRow) {
          const assignedLab = await findAssignedLabWorkByProgress(
            progressRow.localUserId,
            progressRow.labWorkId
          );
          if (assignedLab) {
            await updateAssignedLabWork(assignedLab.id, {
              grade: input.grade,
              teacherComment: input.teacherComment,
              status:
                input.status === "completed" ? "completed" : undefined,
              completedAt:
                input.status === "completed" ? now : undefined,
            });
          }
        }

        await createAuditEntry({
          actorId: ctx.localUser!.id,
          actorType: "user",
          action: "grade",
          resource: "lab_progress",
          resourceId: input.id,
          details: { grade: input.grade, comment: input.teacherComment },
        });

        return { success: true };
      }

      const updateData: Record<string, unknown> = {
        updatedAt: now,
      };
      if (input.grade !== undefined) updateData.grade = input.grade;
      if (input.teacherComment !== undefined)
        updateData.teacherComment = input.teacherComment;
      if (input.status !== undefined) {
        updateData.status = input.status;
        if (input.status === "completed") {
          updateData.completedAt = now;
        }
      }

      await learningDb
        .update(assignedProblems)
        .set(updateData)
        .where(eq(assignedProblems.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "grade",
        resource: "assigned_problems",
        resourceId: input.id,
        details: { grade: input.grade, comment: input.teacherComment },
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // JUPYTER NOTEBOOKS CRUD
  // ═══════════════════════════════════════════════════════════

  listJupyterNotebooks: adminQuery.query(async () => {
    const jupyterDb = getJupyterDb();
    const contentDb = getContentDb();

    const notebooks = await jupyterDb
      .select()
      .from(jupyterNotebooks)
      .orderBy(desc(jupyterNotebooks.createdAt));

    // Get subtopic node names
    const subtopicNodeIds = notebooks.map(n => n.subtopicNodeId);
    const subtopicMap = new Map<number, string>();
    if (subtopicNodeIds.length > 0) {
      const subtopicList = await contentDb
        .select({ id: topicNodes.id, title: topicNodes.title })
        .from(topicNodes)
        .where(inArray(topicNodes.id, subtopicNodeIds));
      for (const s of subtopicList) subtopicMap.set(s.id, s.title);
    }

    // Get access counts
    const accessList = await jupyterDb
      .select({
        notebookId: jupyterNotebookAccess.notebookId,
        count: count(),
      })
      .from(jupyterNotebookAccess)
      .groupBy(jupyterNotebookAccess.notebookId);
    const accessCountMap = new Map(
      accessList.map(a => [a.notebookId, a.count])
    );

    return notebooks.map(n => ({
      ...n,
      subtopicTitle: subtopicMap.get(n.subtopicNodeId) ?? "—",
      accessCount: accessCountMap.get(n.id) ?? 0,
    }));
  }),

  createJupyterNotebook: adminQuery
    .input(
      z.object({
        subtopicNodeId: z.number().positive(),
        title: z.string().min(1).max(255),
        filename: z.string().min(1).max(255),
        filePath: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getJupyterDb();
      const result = await db.insert(jupyterNotebooks).values({
        subtopicNodeId: input.subtopicNodeId,
        title: input.title,
        filename: input.filename,
        filePath: input.filePath,
        uploadedBy: ctx.localUser!.id,
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "jupyter_notebooks",
        resourceId: id,
        details: { title: input.title, subtopicNodeId: input.subtopicNodeId },
      });

      return { id, success: true };
    }),

  deleteJupyterNotebook: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getJupyterDb();
      // Delete access entries first
      await db
        .delete(jupyterNotebookAccess)
        .where(eq(jupyterNotebookAccess.notebookId, input.id));

      await db
        .delete(jupyterNotebooks)
        .where(eq(jupyterNotebooks.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "jupyter_notebooks",
        resourceId: input.id,
      });

      return { success: true };
    }),

  // ── Jupyter Notebook Access Management ──

  listJupyterAccess: adminQuery
    .input(z.object({ notebookId: z.number().positive() }))
    .query(async ({ input }) => {
      const jupyterDb = getJupyterDb();
      const authDb = getAuthDb();

      const accesses = await jupyterDb
        .select()
        .from(jupyterNotebookAccess)
        .where(eq(jupyterNotebookAccess.notebookId, input.notebookId));

      const studentIds = accesses.map(a => a.localUserId);
      const studentMap = new Map<number, typeof localUsers.$inferSelect>();
      if (studentIds.length > 0) {
        const students = await authDb
          .select()
          .from(localUsers)
          .where(inArray(localUsers.id, studentIds));
        for (const s of students) studentMap.set(s.id, s);
      }

      return accesses.map(a => ({
        id: a.id,
        notebookId: a.notebookId,
        localUserId: a.localUserId,
        grantedAt: a.grantedAt,
        studentName: studentMap.get(a.localUserId)?.name ?? "—",
        studentLogin: studentMap.get(a.localUserId)?.login ?? "—",
      }));
    }),

  grantJupyterAccess: adminQuery
    .input(
      z.object({
        notebookId: z.number().positive(),
        localUserId: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const jupyterDb = getJupyterDb();
      const notificationsDb = getNotificationsDb();

      // Check if already granted
      const existing = await jupyterDb
        .select()
        .from(jupyterNotebookAccess)
        .where(
          and(
            eq(jupyterNotebookAccess.notebookId, input.notebookId),
            eq(jupyterNotebookAccess.localUserId, input.localUserId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, alreadyGranted: true };
      }

      await jupyterDb.insert(jupyterNotebookAccess).values({
        notebookId: input.notebookId,
        localUserId: input.localUserId,
        grantedBy: ctx.localUser!.id,
      });

      // Get notebook info for notification
      const notebook = await jupyterDb
        .select()
        .from(jupyterNotebooks)
        .where(eq(jupyterNotebooks.id, input.notebookId))
        .limit(1);

      // Create notification for student
      await notificationsDb.insert(notifications).values({
        localUserId: input.localUserId,
        type: "jupyter_notebook",
        title: "Доступен новый Jupyter-ноутбук",
        message: `Вам открыт доступ к ноутбуку "${notebook[0]?.title ?? "—"}". Скачайте его в своём профиле.`,
        resourceId: input.notebookId,
      });

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "grant_access",
        resource: "jupyter_notebook_access",
        resourceId: input.notebookId,
        details: { localUserId: input.localUserId },
      });

      return { success: true, alreadyGranted: false };
    }),

  revokeJupyterAccess: adminQuery
    .input(z.object({ accessId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getJupyterDb();
      await db
        .delete(jupyterNotebookAccess)
        .where(eq(jupyterNotebookAccess.id, input.accessId));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "revoke_access",
        resource: "jupyter_notebook_access",
        resourceId: input.accessId,
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // Uploaded Images Gallery
  // ═══════════════════════════════════════════════════════════

  listImages: adminQuery.query(async () => {
    const db = getMediaDb();
    return db
      .select({
        id: images.id,
        filename: images.filename,
        originalName: images.originalName,
        mimeType: images.mimeType,
        createdAt: images.createdAt,
      })
      .from(images)
      .orderBy(desc(images.createdAt));
  }),
});
