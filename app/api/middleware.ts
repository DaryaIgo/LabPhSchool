/**
 * tRPC Middleware — RBAC-Enabled Procedure Types
 *
 * Procedure hierarchy:
 *   publicQuery    → No authentication
 *   authedQuery    → Any authenticated user
 *   adminQuery     → Admin role required
 *   studentQuery   → Student role required (active account)
 *   requirePermission(resource, action) → Fine-grained permission check
 */

import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { hasPermission } from "./queries/roles";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// ── Level 1: Require any authentication ──
const requireAuth = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.localUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, localUser: ctx.localUser } });
});

export const authedQuery = t.procedure.use(requireAuth);

// ── Level 2a: Require admin role ──
const requireAdmin = t.middleware(async opts => {
  const { ctx, next } = opts;

  // Must be authenticated
  if (!ctx.localUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  // Must have admin role
  if (ctx.role?.name !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ErrorMessages.insufficientRole,
    });
  }

  return next({ ctx: { ...ctx, localUser: ctx.localUser } });
});

export const adminQuery = t.procedure.use(requireAuth).use(requireAdmin);

// ── Level 2b: Require student role ──
const requireStudent = t.middleware(async opts => {
  const { ctx, next } = opts;

  // Must have local user (student auth)
  if (!ctx.localUser) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Student access required",
    });
  }

  // Account must be active
  if (ctx.localUser.status !== "active") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        ctx.localUser.status === "suspended"
          ? "Account suspended. Contact your teacher."
          : "Account is inactive",
    });
  }

  // Must have student role
  if (ctx.role?.name !== "student") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Student role required",
    });
  }

  return next({ ctx: { ...ctx, localUser: ctx.localUser } });
});

export const studentQuery = t.procedure.use(requireAuth).use(requireStudent);

// ── Level 3: Require specific permission ──
export function requirePermission(resource: string, action: string) {
  return t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.localUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.unauthenticated,
      });
    }

    const has = hasPermission(ctx.role ?? null, resource, action);
    if (!has) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing permission: ${resource}:${action}`,
      });
    }

    return next({ ctx: { ...ctx, localUser: ctx.localUser } });
  });
}
