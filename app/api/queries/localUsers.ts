/**
 * Local User (Student) Query Functions
 *
 * Replaces the old students.ts with full CRUD operations
 * using the new local_users table with bcrypt passwords.
 */

import { eq, and, like, desc, count } from "drizzle-orm";
import { getAuthDb } from "./connection";
import { localUsers, roles } from "@db/schema/auth";
import type { InsertLocalUser } from "@db/schema/auth";

// ── READ ──

export async function findLocalUserByLogin(login: string) {
  const rows = await getAuthDb()
    .select()
    .from(localUsers)
    .where(eq(localUsers.login, login))
    .limit(1);
  return rows.at(0);
}

export async function findLocalUserById(id: number) {
  const rows = await getAuthDb()
    .select()
    .from(localUsers)
    .where(eq(localUsers.id, id))
    .limit(1);
  return rows.at(0);
}

export async function findLocalUserWithRole(id: number) {
  const rows = await getAuthDb()
    .select({
      id: localUsers.id,
      login: localUsers.login,
      name: localUsers.name,
      status: localUsers.status,
      roleId: localUsers.roleId,
      roleName: roles.name,
      avatar: localUsers.avatar,
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
  role?: string;
  page?: number;
  pageSize?: number;
}) {
  const db = getAuthDb();
  const { status, search, role, page = 1, pageSize = 50 } = options ?? {};

  const conditions = [];
  if (status) {
    conditions.push(eq(localUsers.status, status));
  }
  if (search) {
    conditions.push(like(localUsers.name, `%${search}%`));
  }
  if (role) {
    conditions.push(eq(roles.name, role));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(localUsers)
    .innerJoin(roles, eq(localUsers.roleId, roles.id))
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
  // local_users is reserved for students; force student role.
  const result = await getAuthDb()
    .insert(localUsers)
    .values({ ...data, roleId: 2 });
  return result;
}

// ── UPDATE ──

export async function updateLocalUser(
  id: number,
  data: Partial<{
    name: string;
    passwordHash: string;
    status: "active" | "inactive" | "suspended";
    avatar: string | null;
  }>
) {
  return getAuthDb()
    .update(localUsers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(localUsers.id, id));
}

export async function updateLocalUserLastLogin(id: number) {
  return getAuthDb()
    .update(localUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(localUsers.id, id));
}

// ── DELETE ──

export async function deleteLocalUser(id: number) {
  return getAuthDb().delete(localUsers).where(eq(localUsers.id, id));
}

// ── STATUS ──

export async function suspendLocalUser(id: number) {
  return getAuthDb()
    .update(localUsers)
    .set({ status: "suspended", updatedAt: new Date() })
    .where(eq(localUsers.id, id));
}

export async function activateLocalUser(id: number) {
  return getAuthDb()
    .update(localUsers)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(localUsers.id, id));
}
