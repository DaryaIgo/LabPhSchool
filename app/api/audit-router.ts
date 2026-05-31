/**
 * Audit Log Router
 *
 * Admin-only access to the security audit log.
 * Provides paginated, filterable views of all system actions.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { listAuditEntries, getAuditStats } from "./queries/audit";

export const auditRouter = createRouter({
  /**
   * List audit log entries with pagination and filtering.
   */
  list: adminQuery
    .input(
      z
        .object({
          actorId: z.number().positive().optional(),
          actorType: z.enum(["user", "local_user"]).optional(),
          resource: z.string().max(50).optional(),
          action: z.string().max(50).optional(),
          page: z.number().positive().default(1),
          pageSize: z.number().positive().max(100).default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return listAuditEntries(input ?? {});
    }),

  /**
   * Get audit statistics.
   */
  stats: adminQuery.query(async () => {
    return getAuditStats();
  }),
});
