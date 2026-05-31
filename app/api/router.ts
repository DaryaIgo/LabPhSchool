/**
 * tRPC App Router — Aggregates all feature routers.
 *
 * Routers:
 *   - unifiedAuth: Login/logout/me for all users
 *   - student: Student CRUD + progress (admin) & student self-service
 *   - admin: CMS for topics, subtopics, labs, problems
 *   - audit: Audit log viewing (admin-only)
 *   - enrollment: Course enrollment management
 *   - course: Public course data
 *   - problems: Problem viewing
 */

import { courseRouter } from "./course-router";
import { problemsRouter } from "./problems-router";
import { adminRouter } from "./admin-router";
import { studentRouter } from "./student-router";
import { unifiedAuthRouter } from "./unified-auth-router";
import { auditRouter } from "./audit-router";
import { enrollmentRouter } from "./enrollment-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  unifiedAuth: unifiedAuthRouter,
  course: courseRouter,
  problems: problemsRouter,
  admin: adminRouter,
  student: studentRouter,
  audit: auditRouter,
  enrollment: enrollmentRouter,
});

export type AppRouter = typeof appRouter;
