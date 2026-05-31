/**
 * Role & Permission Query Functions
 *
 * Provides RBAC role resolution with permissions loading.
 */

import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { roles, permissions, rolePermissions } from "@db/schema";

export type RoleWithPermissions = {
  id: number;
  name: string;
  description: string | null;
  permissions: { id: number; name: string; resource: string; action: string }[];
};

/**
 * Get a role by its name (e.g., "admin", "student").
 */
export async function findRoleByName(
  name: string
): Promise<RoleWithPermissions | null> {
  const db = getDb();

  const role = await db.query.roles.findFirst({
    where: eq(roles.name, name),
  });

  if (!role) return null;

  // Load permissions for this role
  const perms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, role.id));

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: perms,
  };
}

/**
 * Get a role by its ID, including all permissions.
 */
export async function getRoleWithPermissions(
  roleId: number
): Promise<RoleWithPermissions | null> {
  const db = getDb();

  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId),
  });

  if (!role) return null;

  const perms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, role.id));

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: perms,
  };
}

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(
  role: RoleWithPermissions | null,
  resource: string,
  action: string
): boolean {
  if (!role) return false;
  return role.permissions.some(
    (p) => p.resource === resource && p.action === action
  );
}

/**
 * List all roles.
 */
export async function listRoles() {
  return getDb().select().from(roles);
}

/**
 * List all permissions.
 */
export async function listPermissions() {
  return getDb().select().from(permissions);
}

/**
 * Get permissions for a specific role.
 */
export async function getRolePermissions(roleId: number) {
  return getDb()
    .select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
      description: permissions.description,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));
}
