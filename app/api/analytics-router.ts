/**
 * Analytics Router — Visit tracking and statistics.
 *
 * - trackVisit: public mutation called from the SPA on route changes.
 * - stats / visitsByDay / topPages / recentVisits: admin-only queries.
 */

import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  createPageVisit,
  getPageVisitStats,
  getVisitsByDay,
  getTopPages,
  getRecentVisits,
  cleanupOldPageVisits,
} from "./queries/analytics";

function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "";
}

export const analyticsRouter = createRouter({
  trackVisit: publicQuery
    .input(
      z.object({
        path: z.string().max(500),
        referrer: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const headers = ctx.req.headers;

      await createPageVisit({
        path: input.path,
        referrer: input.referrer,
        ipAddress: getClientIp(headers),
        userAgent: headers.get("user-agent") ?? "",
        localUserId: ctx.localUser?.id ?? null,
      });

      // Periodic cleanup of raw visits older than 30 days.
      // Probability keeps the delete overhead negligible on every request.
      if (Math.random() < 0.05) {
        cleanupOldPageVisits(30).catch(() => {
          // Silently ignore cleanup failures so they never break tracking.
        });
      }

      return { success: true };
    }),

  stats: adminQuery.query(async () => {
    return getPageVisitStats();
  }),

  visitsByDay: adminQuery
    .input(
      z
        .object({
          days: z.number().min(1).max(90).default(14),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return getVisitsByDay(input?.days ?? 14);
    }),

  topPages: adminQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return getTopPages(input?.limit ?? 10);
    }),

  recentVisits: adminQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return getRecentVisits(input?.limit ?? 20);
    }),
});
