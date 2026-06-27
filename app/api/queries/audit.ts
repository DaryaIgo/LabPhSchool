/**
 * Audit Log Query Functions
 *
 * Security audit trail for tracking all significant actions.
 */

import { eq, and, desc, gte, lte, count } from "drizzle-orm";
import { getAuditDb } from "./connection";
import { auditLog } from "@db/schema/audit";

export async function createAuditEntry(data: {
  actorId: number;
  actorType: "user" | "local_user";
  action: string;
  resource: string;
  resourceId?: number;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}) {
  return getAuditDb()
    .insert(auditLog)
    .values({
      actorId: data.actorId,
      actorType: data.actorType,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ?? null,
      details: data.details ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      success: data.success ?? true,
      errorMessage: data.errorMessage ?? null,
    });
}

export async function listAuditEntries(options?: {
  actorId?: number;
  actorType?: "user" | "local_user";
  resource?: string;
  action?: string;
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = getAuditDb();
  const {
    actorId,
    actorType,
    resource,
    action,
    page = 1,
    pageSize = 50,
    startDate,
    endDate,
  } = options ?? {};

  const conditions = [];
  if (actorId !== undefined) {
    conditions.push(eq(auditLog.actorId, actorId));
  }
  if (actorType) {
    conditions.push(eq(auditLog.actorType, actorType));
  }
  if (resource) {
    conditions.push(eq(auditLog.resource, resource));
  }
  if (action) {
    conditions.push(eq(auditLog.action, action));
  }
  if (startDate) {
    conditions.push(gte(auditLog.createdAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(auditLog.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(auditLog)
    .where(whereClause);
  const total = totalResult.count;

  const results = await db
    .select()
    .from(auditLog)
    .where(whereClause)
    .orderBy(desc(auditLog.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    entries: results,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAuditStats() {
  const db = getAuditDb();

  const [totalResult] = await db.select({ count: count() }).from(auditLog);
  const [loginResult] = await db
    .select({ count: count() })
    .from(auditLog)
    .where(eq(auditLog.action, "login"));
  const [failedResult] = await db
    .select({ count: count() })
    .from(auditLog)
    .where(and(eq(auditLog.action, "login"), eq(auditLog.success, false)));

  return {
    totalEntries: totalResult.count,
    totalLogins: loginResult.count,
    failedLogins: failedResult.count,
  };
}
