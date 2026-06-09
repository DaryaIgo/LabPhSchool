/**
 * Admin Router — CMS & User Management
 *
 * All endpoints require adminQuery middleware (admin role).
 * Operations are protected by RBAC and logged to audit_log.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  topics,
  subtopics,
  problems,
  localUsers,
  roles,
  topicNodes,
  labWorks,
  resources,
  labProgress,
  jupyterNotebooks,
  jupyterNotebookAccess,
  notifications,
} from "@db/schema";
import { eq, asc, desc, count, and } from "drizzle-orm";
import { createAuditEntry } from "./queries/audit";

export const adminRouter = createRouter({
  // ═══════════════════════════════════════════════════════════
  // Dashboard Statistics
  // ═══════════════════════════════════════════════════════════

  dashboardStats: adminQuery.query(async () => {
    const db = getDb();

    const [studentCount] = await db
      .select({ count: count() })
      .from(localUsers)
      .innerJoin(roles, eq(localUsers.roleId, roles.id))
      .where(eq(roles.name, "student"));
    const [activeCount] = await db
      .select({ count: count() })
      .from(localUsers)
      .innerJoin(roles, eq(localUsers.roleId, roles.id))
      .where(and(eq(roles.name, "student"), eq(localUsers.status, "active")));
    const [suspendedCount] = await db
      .select({ count: count() })
      .from(localUsers)
      .innerJoin(roles, eq(localUsers.roleId, roles.id))
      .where(and(eq(roles.name, "student"), eq(localUsers.status, "suspended")));
    const [topicCount] = await db.select({ count: count() }).from(topics);
    const [labWorkCount] = await db.select({ count: count() }).from(labWorks);
    const [resourceCount] = await db.select({ count: count() }).from(resources);
    const [submissionCount] = await db
      .select({ count: count() })
      .from(labProgress)
      .where(eq(labProgress.status, "submitted"));

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
        labSubmissions: submissionCount.count,
      },
    };
  }),

  // ═══════════════════════════════════════════════════════════
  // TOPICS CRUD
  // ═══════════════════════════════════════════════════════════

  listTopics: adminQuery.query(async () => {
    return getDb().select().from(topics).orderBy(asc(topics.order));
  }),

  createTopic: adminQuery
    .input(
      z.object({
        order: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        formula: z.string().max(500).optional(),
        description: z.string().max(5000).optional(),
        shortDesc: z.string().max(500).optional(),
        color: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(topics).values({
        order: input.order,
        title: input.title,
        slug: input.slug,
        formula: input.formula ?? null,
        description: input.description ?? null,
        shortDesc: input.shortDesc ?? null,
        color: input.color ?? "#2eff8c",
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "topics",
        resourceId: id,
        details: { title: input.title, slug: input.slug },
      });

      return { id, success: true };
    }),

  updateTopic: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1).max(255).optional(),
        formula: z.string().max(500).optional(),
        description: z.string().max(5000).optional(),
        shortDesc: z.string().max(500).optional(),
        color: z.string().max(20).optional(),
        order: z.number().int().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.formula !== undefined) updateData.formula = data.formula;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.shortDesc !== undefined) updateData.shortDesc = data.shortDesc;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.order !== undefined) updateData.order = data.order;

      await db.update(topics).set(updateData).where(eq(topics.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "topics",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  deleteTopic: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getDb().delete(topics).where(eq(topics.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "topics",
        resourceId: input.id,
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // TOPIC NODES CRUD (hierarchical markdown topics)
  // ═══════════════════════════════════════════════════════════

  listTopicNodes: adminQuery.query(async () => {
    return getDb().select().from(topicNodes).orderBy(asc(topicNodes.order));
  }),

  getTopicNode: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
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
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        content: z.string().max(100000).optional(),
        color: z.string().max(20).optional(),
        labCategorySlug: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(topicNodes).values({
        parentId: input.parentId ?? null,
        order: input.order,
        title: input.title,
        slug: input.slug,
        content: input.content ?? null,
        color: input.color ?? null,
        labCategorySlug: input.labCategorySlug ?? null,
      });
      const id = Number(result[0].insertId);
      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "topic_nodes",
        resourceId: id,
        details: { title: input.title, slug: input.slug, parentId: input.parentId },
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
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
        content: z.string().max(100000).optional(),
        color: z.string().max(20).optional(),
        labCategorySlug: z.string().max(255).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.parentId !== undefined) updateData.parentId = data.parentId;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.labCategorySlug !== undefined) updateData.labCategorySlug = data.labCategorySlug;

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
      const db = getDb();
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

      const db = getDb();
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
      const db = getDb();
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
  // SUBTOPICS CRUD
  // ═══════════════════════════════════════════════════════════

  listSubtopics: adminQuery.query(async () => {
    return getDb()
      .select()
      .from(subtopics)
      .orderBy(asc(subtopics.topicId), asc(subtopics.order));
  }),

  updateSubtopic: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        content: z.string().max(100000).optional(),
        jupyterUrl: z.string().max(500).optional().nullable(),
        order: z.number().int().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.jupyterUrl !== undefined) updateData.jupyterUrl = data.jupyterUrl;
      if (data.order !== undefined) updateData.order = data.order;

      await db.update(subtopics).set(updateData).where(eq(subtopics.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "subtopics",
        resourceId: id,
        details: { fields: Object.keys(data) },
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // PROBLEMS CRUD
  // ═══════════════════════════════════════════════════════════

  createProblem: adminQuery
    .input(
      z.object({
        problemTypeId: z.number().positive(),
        order: z.number().int().min(1),
        level: z.enum(["basic", "intermediate", "advanced"]),
        source: z.string().max(255).optional(),
        condition: z.string().min(1).max(10000),
        given: z.string().max(5000).optional(),
        find: z.string().max(2000).optional(),
        solution: z.string().min(1).max(20000),
        answer: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(problems).values({
        problemTypeId: input.problemTypeId,
        order: input.order,
        level: input.level,
        source: input.source ?? null,
        condition: input.condition,
        given: input.given ?? null,
        find: input.find ?? null,
        solution: input.solution,
        answer: input.answer,
      });

      const id = Number(result[0].insertId);

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "create",
        resource: "problems",
        resourceId: id,
      });

      return { id, success: true };
    }),

  updateProblem: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        condition: z.string().max(10000).optional(),
        given: z.string().max(5000).optional(),
        find: z.string().max(2000).optional(),
        solution: z.string().max(20000).optional(),
        answer: z.string().max(5000).optional(),
        source: z.string().max(255).optional(),
        level: z.enum(["basic", "intermediate", "advanced"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.condition !== undefined) updateData.condition = data.condition;
      if (data.given !== undefined) updateData.given = data.given;
      if (data.find !== undefined) updateData.find = data.find;
      if (data.solution !== undefined) updateData.solution = data.solution;
      if (data.answer !== undefined) updateData.answer = data.answer;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.level !== undefined) updateData.level = data.level;

      await db.update(problems).set(updateData).where(eq(problems.id, id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "update",
        resource: "problems",
        resourceId: id,
      });

      return { success: true };
    }),

  deleteProblem: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getDb().delete(problems).where(eq(problems.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "delete",
        resource: "problems",
        resourceId: input.id,
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // RESOURCES CRUD
  // ═══════════════════════════════════════════════════════════

  listResources: adminQuery.query(async () => {
    return getDb().select().from(resources).orderBy(asc(resources.id));
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
      const db = getDb();
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
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
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
      await getDb().delete(resources).where(eq(resources.id, input.id));

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
  // Lab Submissions Review
  // ═══════════════════════════════════════════════════════════

  getLabSubmissions: adminQuery
    .input(
      z.object({
        status: z.enum(["submitted", "completed"]).optional(),
        labWorkId: z.number().positive().optional(),
        studentId: z.number().positive().optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (input?.status) {
        conditions.push(eq(labProgress.status, input.status));
      } else {
        conditions.push(eq(labProgress.status, "submitted"));
      }
      if (input?.labWorkId) {
        conditions.push(eq(labProgress.labWorkId, input.labWorkId));
      }
      if (input?.studentId) {
        conditions.push(eq(labProgress.localUserId, input.studentId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select({
          id: labProgress.id,
          status: labProgress.status,
          mode: labProgress.mode,
          data: labProgress.data,
          measurements: labProgress.measurements,
          conclusion: labProgress.conclusion,
          grade: labProgress.grade,
          teacherComment: labProgress.teacherComment,
          startedAt: labProgress.startedAt,
          completedAt: labProgress.completedAt,
          updatedAt: labProgress.updatedAt,
          studentId: labProgress.localUserId,
          studentName: localUsers.name,
          studentLogin: localUsers.login,
          labWorkId: labProgress.labWorkId,
          labWorkTitle: labWorks.title,
          labWorkSlug: labWorks.slug,
        })
        .from(labProgress)
        .innerJoin(localUsers, eq(labProgress.localUserId, localUsers.id))
        .innerJoin(labWorks, eq(labProgress.labWorkId, labWorks.id))
        .where(whereClause)
        .orderBy(desc(labProgress.updatedAt))
        .limit(pageSize)
        .offset(offset);

      const [countResult] = await db
        .select({ count: count() })
        .from(labProgress)
        .innerJoin(localUsers, eq(labProgress.localUserId, localUsers.id))
        .innerJoin(labWorks, eq(labProgress.labWorkId, labWorks.id))
        .where(whereClause);

      return {
        items,
        total: countResult.count,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.count / pageSize),
      };
    }),

  getLabSubmissionById: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [item] = await db
        .select({
          id: labProgress.id,
          status: labProgress.status,
          mode: labProgress.mode,
          data: labProgress.data,
          measurements: labProgress.measurements,
          conclusion: labProgress.conclusion,
          grade: labProgress.grade,
          teacherComment: labProgress.teacherComment,
          startedAt: labProgress.startedAt,
          completedAt: labProgress.completedAt,
          updatedAt: labProgress.updatedAt,
          studentId: labProgress.localUserId,
          studentName: localUsers.name,
          studentLogin: localUsers.login,
          labWorkId: labProgress.labWorkId,
          labWorkTitle: labWorks.title,
          labWorkSlug: labWorks.slug,
          labWorkGoal: labWorks.goal,
          labWorkTheory: labWorks.theory,
        })
        .from(labProgress)
        .innerJoin(localUsers, eq(labProgress.localUserId, localUsers.id))
        .innerJoin(labWorks, eq(labProgress.labWorkId, labWorks.id))
        .where(eq(labProgress.id, input.id));

      if (!item) {
        throw new Error("Submission not found");
      }

      return item;
    }),

  gradeLabSubmission: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        grade: z.number().min(1).max(5).optional(),
        teacherComment: z.string().max(2000).optional(),
        status: z.enum(["submitted", "completed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (input.grade !== undefined) updateData.grade = input.grade;
      if (input.teacherComment !== undefined) updateData.teacherComment = input.teacherComment;
      if (input.status !== undefined) updateData.status = input.status;

      await db
        .update(labProgress)
        .set(updateData)
        .where(eq(labProgress.id, input.id));

      await createAuditEntry({
        actorId: ctx.localUser!.id,
        actorType: "user",
        action: "grade",
        resource: "lab_progress",
        resourceId: input.id,
        details: { grade: input.grade, comment: input.teacherComment },
      });

      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════
  // JUPYTER NOTEBOOKS CRUD
  // ═══════════════════════════════════════════════════════════

  listJupyterNotebooks: adminQuery.query(async () => {
    const db = getDb();
    const notebooks = await db
      .select()
      .from(jupyterNotebooks)
      .orderBy(desc(jupyterNotebooks.createdAt));

    // Get subtopic names
    const subtopicList = await db.select().from(subtopics);
    const subtopicMap = new Map(subtopicList.map((s) => [s.id, s.title]));

    // Get access counts
    const accessList = await db
      .select({
        notebookId: jupyterNotebookAccess.notebookId,
        count: count(),
      })
      .from(jupyterNotebookAccess)
      .groupBy(jupyterNotebookAccess.notebookId);
    const accessCountMap = new Map(accessList.map((a) => [a.notebookId, a.count]));

    return notebooks.map((n) => ({
      ...n,
      subtopicTitle: subtopicMap.get(n.subtopicId) ?? "—",
      accessCount: accessCountMap.get(n.id) ?? 0,
    }));
  }),

  createJupyterNotebook: adminQuery
    .input(
      z.object({
        subtopicId: z.number().positive(),
        title: z.string().min(1).max(255),
        filename: z.string().min(1).max(255),
        filePath: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(jupyterNotebooks).values({
        subtopicId: input.subtopicId,
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
        details: { title: input.title, subtopicId: input.subtopicId },
      });

      return { id, success: true };
    }),

  deleteJupyterNotebook: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Delete access entries first
      await db
        .delete(jupyterNotebookAccess)
        .where(eq(jupyterNotebookAccess.notebookId, input.id));

      await db.delete(jupyterNotebooks).where(eq(jupyterNotebooks.id, input.id));

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
      const db = getDb();
      const accesses = await db
        .select({
          id: jupyterNotebookAccess.id,
          notebookId: jupyterNotebookAccess.notebookId,
          localUserId: jupyterNotebookAccess.localUserId,
          grantedAt: jupyterNotebookAccess.grantedAt,
          studentName: localUsers.name,
          studentLogin: localUsers.login,
        })
        .from(jupyterNotebookAccess)
        .innerJoin(localUsers, eq(jupyterNotebookAccess.localUserId, localUsers.id))
        .where(eq(jupyterNotebookAccess.notebookId, input.notebookId));

      return accesses;
    }),

  grantJupyterAccess: adminQuery
    .input(
      z.object({
        notebookId: z.number().positive(),
        localUserId: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check if already granted
      const existing = await db
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

      await db.insert(jupyterNotebookAccess).values({
        notebookId: input.notebookId,
        localUserId: input.localUserId,
        grantedBy: ctx.localUser!.id,
      });

      // Get notebook info for notification
      const notebook = await db
        .select()
        .from(jupyterNotebooks)
        .where(eq(jupyterNotebooks.id, input.notebookId))
        .limit(1);

      // Create notification for student
      await db.insert(notifications).values({
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
      const db = getDb();
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

});
