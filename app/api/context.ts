/**
 * tRPC Context Builder — Unified Authentication
 *
 * Resolves authentication from multiple sources:
 * 1. OAuth session cookie (auth_session) → Teacher/Admin
 * 2. Student JWT cookie (student_session) → Student
 */

import type { LocalUser } from "@db/schema";
import { verifyStudentSession } from "./student-session";
import { findLocalUserWithRole } from "./queries/localUsers";
import {
  getRoleWithPermissions,
  type RoleWithPermissions,
} from "./queries/roles";

export type UnifiedActor = {
  type: "local_user";
  localUser: LocalUser & { roleName?: string };
  role: RoleWithPermissions;
} | null;

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  localUser?: LocalUser & { roleName?: string };
  role?: RoleWithPermissions;
  actor?: UnifiedActor;
};

export async function createContext(opts: {
  req: Request;
  resHeaders: Headers;
}): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // ── Try local auth via JWT cookie ──
  try {
    const payload = await verifyStudentSession(opts.req.headers);
    if (payload) {
      const localUser = await findLocalUserWithRole(payload.localUserId);
      if (localUser) {
        const userRecord: LocalUser & { roleName?: string } = {
          id: localUser.id,
          login: localUser.login,
          passwordHash: "",
          name: localUser.name,
          status: localUser.status as "active" | "inactive" | "suspended",
          roleId: localUser.roleId,
          createdBy: localUser.createdBy,
          avatar: localUser.avatar ?? null,
          createdAt: localUser.createdAt,
          updatedAt: localUser.createdAt,
          lastLoginAt: localUser.lastLoginAt,
          roleName: localUser.roleName,
        };
        ctx.localUser = userRecord;
        const role = await getRoleWithPermissions(localUser.roleId);
        ctx.role = role ?? undefined;
        ctx.actor = role
          ? { type: "local_user", localUser: userRecord, role }
          : null;
        return ctx;
      }
    }
  } catch {
    // Student auth failed
  }

  return ctx; // Unauthenticated
}
