/**
 * Audit Log Query Functions
 *
 * Security audit trail for tracking significant actions.
 *
 * Notes on storage efficiency:
 * - Read/list actions are not persisted (they generate too much noise).
 * - Details are stripped to identifiers and short primitive values.
 * - Entries older than 90 days are removed automatically.
 */

import { eq, and, desc, gte, lte, count } from "drizzle-orm";
import { getAuditDb } from "./connection";
import { auditLog } from "@db/schema/audit";

/** How many days audit entries are kept. */
const AUDIT_LOG_RETENTION_DAYS = 90;

/** Maximum length for a single string value inside details. */
const MAX_STRING_LENGTH = 200;

/** Hard cap for the JSONified details payload. */
const MAX_DETAILS_JSON_LENGTH = 4000;

const READ_ACTIONS = new Set(["list", "get", "read", "view", "search"]);

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) return value;
  return value.slice(0, MAX_STRING_LENGTH) + "...";
}

function isShortIdentifierKey(key: string): boolean {
  return (
    key === "name" ||
    key === "title" ||
    key === "slug" ||
    key === "login" ||
    key === "status"
  );
}

function sanitizePrimitive(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return truncateString(value);
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;
  // Drop objects, arrays and functions to keep the payload small.
  return undefined;
}

/**
 * Compact audit details before storing.
 *
 * - list/get/read/view/search actions return null -> not logged at all.
 * - create/delete keep only `id`, *Id fields and short identifiers.
 * - update and other actions keep only primitive values.
 */
function sanitizeAuditDetails(
  action: string,
  details: Record<string, unknown> | undefined
): Record<string, unknown> | null {
  if (!details) return null;

  if (READ_ACTIONS.has(action)) {
    return null;
  }

  const result: Record<string, unknown> = {};

  if (action === "create" || action === "delete") {
    if (details.id !== undefined) {
      result.id = details.id;
    }

    for (const [key, value] of Object.entries(details)) {
      if (key.endsWith("Id") && typeof value === "number") {
        result[key] = value;
      } else if (isShortIdentifierKey(key) && typeof value === "string") {
        result[key] = truncateString(value);
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  // update, grade, enroll, suspend, activate, etc.
  for (const [key, value] of Object.entries(details)) {
    const sanitized = sanitizePrimitive(value);
    if (sanitized !== undefined) {
      result[key] = sanitized;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function capDetailsSize(
  details: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!details) return null;

  let json = JSON.stringify(details);
  if (json.length <= MAX_DETAILS_JSON_LENGTH) return details;

  // If still too large, drop string values until it fits.
  const trimmed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (typeof value === "string") {
      const available =
        MAX_DETAILS_JSON_LENGTH - JSON.stringify(trimmed).length - 50;
      if (available > 0) {
        trimmed[key] =
          value.length > available ? value.slice(0, available) + "..." : value;
      }
    } else {
      trimmed[key] = value;
    }

    if (JSON.stringify(trimmed).length >= MAX_DETAILS_JSON_LENGTH) {
      break;
    }
  }

  json = JSON.stringify(trimmed);
  if (json.length > MAX_DETAILS_JSON_LENGTH) {
    return null;
  }

  return trimmed;
}

export async function createAuditEntry(data: {
  actorId: number;
  actorType: "admin_user" | "local_user";
  action: string;
  resource: string;
  resourceId?: number;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}) {
  const sanitized = capDetailsSize(
    sanitizeAuditDetails(data.action, data.details)
  );

  // Skip read/list actions and empty details.
  if (sanitized === null && !data.errorMessage) {
    return [{ insertId: BigInt(0) }] as [{ insertId: bigint }];
  }

  return getAuditDb()
    .insert(auditLog)
    .values({
      actorId: data.actorId,
      actorType: data.actorType,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ?? null,
      details: sanitized,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      success: data.success ?? true,
      errorMessage: data.errorMessage ?? null,
    });
}

export async function cleanupOldAuditEntries() {
  const db = getAuditDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - AUDIT_LOG_RETENTION_DAYS);

  const result = await db
    .delete(auditLog)
    .where(lte(auditLog.createdAt, cutoff));

  const deleted = Number(result[0]?.affectedRows ?? 0);
  return { deleted, cutoff };
}

/** Remove every audit log entry. Use with caution. */
export async function truncateAuditLog() {
  const db = getAuditDb();
  const result = await db.delete(auditLog);
  const deleted = Number(result[0]?.affectedRows ?? 0);
  return { deleted };
}

export async function listAuditEntries(options?: {
  actorId?: number;
  actorType?: "admin_user" | "local_user";
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
