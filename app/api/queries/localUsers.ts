/**
 * Local User (Student) Query Functions
 *
 * Replaces the old students.ts with full CRUD operations
 * using the new local_users table with bcrypt passwords.
 */

import { eq, and, like, desc, count } from "drizzle-orm";
import { getDb } from "./connection";
import { localUsers, studentProgress, roles } from "@db/schema";
import type { InsertLocalUser } from "@db/schema";

// ── READ ──

export async function findLocalUserByLogin(login: string) {
  const rows = await getDb()
    .select()
    .from(localUsers)
    .where(eq(localUsers.login, login))
    .limit(1);
  return rows.at(0);
}

export async function findLocalUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(localUsers)
    .where(eq(localUsers.id, id))
    .limit(1);
  return rows.at(0);
}

export async function findLocalUserWithRole(id: number) {
  const rows = await getDb()
    .select({
      id: localUsers.id,
      login: localUsers.login,
      name: localUsers.name,
      status: localUsers.status,
      roleId: localUsers.roleId,
      roleName: roles.name,
      createdBy: localUsers.createdBy,
      createdAt: localUsers.createdAt,
      lastLoginAt: localUsers.lastLoginAt,
    })
    .from(localUsers)
    .innerJoin(roles, eq(localUsers.roleId, roles.id))
    .where(eq(localUsers.id, id))
    .limit(1);
  return rows.at(0);
}

export async function listLocalUsers(options?: {
  status?: "active" | "inactive" | "suspended";
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const db = getDb();
  const { status, search, page = 1, pageSize = 50 } = options ?? {};

  const conditions = [];
  if (status) {
    conditions.push(eq(localUsers.status, status));
  }
  if (search) {
    conditions.push(
      like(localUsers.name, `%${search}%`)
    );
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(localUsers)
    .where(whereClause);
  const total = totalResult.count;

  // Get paginated results
  const results = await db
    .select({
      id: localUsers.id,
      login: localUsers.login,
      name: localUsers.name,
      status: localUsers.status,
      roleId: localUsers.roleId,
      roleName: roles.name,
      createdBy: localUsers.createdBy,
      createdAt: localUsers.createdAt,
      updatedAt: localUsers.updatedAt,
      lastLoginAt: localUsers.lastLoginAt,
    })
    .from(localUsers)
    .innerJoin(roles, eq(localUsers.roleId, roles.id))
    .where(whereClause)
    .orderBy(desc(localUsers.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    users: results,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ── CREATE ──

export async function createLocalUser(data: InsertLocalUser) {
  const result = await getDb().insert(localUsers).values(data);
  return result;
}

// ── UPDATE ──

export async function updateLocalUser(
  id: number,
  data: Partial<{
    name: string;
    passwordHash: string;
    status: "active" | "inactive" | "suspended";
  }>
) {
  return getDb()
    .update(localUsers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(localUsers.id, id));
}

export async function updateLocalUserLastLogin(id: number) {
  return getDb()
    .update(localUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(localUsers.id, id));
}

// ── DELETE ──

export async function deleteLocalUser(id: number) {
  return getDb().delete(localUsers).where(eq(localUsers.id, id));
}

// ── STATUS ──

export async function suspendLocalUser(id: number) {
  return getDb()
    .update(localUsers)
    .set({ status: "suspended", updatedAt: new Date() })
    .where(eq(localUsers.id, id));
}

export async function activateLocalUser(id: number) {
  return getDb()
    .update(localUsers)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(localUsers.id, id));
}

// ── PROGRESS ──

export async function getLocalUserProgress(localUserId: number) {
  return getDb()
    .select()
    .from(studentProgress)
    .where(eq(studentProgress.localUserId, localUserId));
}

export async function upsertLocalUserProgress(
  localUserId: number,
  subtopicId: number,
  data: {
    theoryCompleted?: "pending" | "completed";
    practiceCompleted?: "pending" | "completed";
    labCompleted?: "pending" | "completed";
    notes?: string;
  }
) {
  const existing = await getDb()
    .select()
    .from(studentProgress)
    .where(
      and(
        eq(studentProgress.localUserId, localUserId),
        eq(studentProgress.subtopicId, subtopicId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return getDb()
      .update(studentProgress)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(studentProgress.id, existing[0].id));
  }

  return getDb()
    .insert(studentProgress)
    .values({
      localUserId,
      subtopicId,
      ...data,
    });
}
