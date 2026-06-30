/**
 * Admin User Query Functions
 *
 * CRUD for local administrator accounts.
 */

import { eq, and, like, desc, count } from "drizzle-orm";
import { getAuthDb } from "./connection";
import { adminUsers } from "@db/schema/auth";
import type { InsertAdminUser } from "@db/schema/auth";

export async function findAdminUserByLogin(login: string) {
  const rows = await getAuthDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.login, login))
    .limit(1);
  return rows.at(0);
}

export async function findAdminUserById(id: number) {
  const rows = await getAuthDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  return rows.at(0);
}

export async function listAdminUsers(options?: {
  status?: "active" | "inactive" | "suspended";
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const db = getAuthDb();
  const { status, search, page = 1, pageSize = 50 } = options ?? {};

  const conditions = [];
  if (status) {
    conditions.push(eq(adminUsers.status, status));
  }
  if (search) {
    conditions.push(like(adminUsers.name, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(adminUsers)
    .where(whereClause);
  const total = totalResult.count;

  const results = await db
    .select()
    .from(adminUsers)
    .where(whereClause)
    .orderBy(desc(adminUsers.createdAt))
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

export async function createAdminUser(data: InsertAdminUser) {
  return getAuthDb().insert(adminUsers).values(data);
}

export async function updateAdminUser(
  id: number,
  data: Partial<{
    name: string;
    status: "active" | "inactive" | "suspended";
    passwordHash: string;
    avatar: string | null;
  }>
) {
  return getAuthDb()
    .update(adminUsers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(adminUsers.id, id));
}

export async function deleteAdminUser(id: number) {
  return getAuthDb().delete(adminUsers).where(eq(adminUsers.id, id));
}

export async function updateAdminUserLastLogin(id: number) {
  return getAuthDb()
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, id));
}
