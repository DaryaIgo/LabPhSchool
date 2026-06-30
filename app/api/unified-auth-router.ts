/**
 * Unified Authentication Router
 *
 * Single login endpoint for both admin and student local authentication.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import {
  findLocalUserByLogin,
  updateLocalUserLastLogin,
} from "./queries/localUsers";
import {
  findAdminUserByLogin,
  updateAdminUserLastLogin,
} from "./queries/adminUsers";
import { comparePassword } from "./lib/password";
import { getStudentSetCookie, getStudentClearCookie } from "./student-session";
import { getAdminSetCookie, getAdminClearCookie } from "./admin-session";
import { getRoleWithPermissions } from "./queries/roles";
import { createAuditEntry } from "./queries/audit";

export const unifiedAuthRouter = createRouter({
  /**
   * Unified login — accepts credentials and returns JWT in HttpOnly cookie.
   * { login, password, type: "student" | "admin" }
   */
  login: publicQuery
    .input(
      z.object({
        login: z.string().min(1).max(100),
        password: z.string().min(1).max(128),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ipAddress =
        ctx.req.headers.get("x-forwarded-for") ??
        ctx.req.headers.get("x-real-ip") ??
        "unknown";
      const userAgent = ctx.req.headers.get("user-agent") ?? "unknown";

      // Try admin login first, then student login.
      const adminUser = await findAdminUserByLogin(input.login);
      if (adminUser) {
        if (adminUser.status === "suspended") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Account suspended.",
          });
        }
        if (adminUser.status === "inactive") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Account is inactive.",
          });
        }

        const passwordValid = await comparePassword(
          input.password,
          adminUser.passwordHash
        );
        if (!passwordValid) {
          await createAuditEntry({
            actorId: adminUser.id,
            actorType: "admin_user",
            action: "login",
            resource: "auth",
            details: { login: input.login, reason: "invalid_password" },
            ipAddress,
            userAgent,
            success: false,
            errorMessage: "Invalid login or password",
          });
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid login or password",
          });
        }

        await updateAdminUserLastLogin(adminUser.id);

        const cookieStr = await getAdminSetCookie(
          {
            adminUserId: adminUser.id,
            login: adminUser.login,
            type: "admin",
          },
          ctx.req.headers
        );
        ctx.resHeaders.append("set-cookie", cookieStr);

        await createAuditEntry({
          actorId: adminUser.id,
          actorType: "admin_user",
          action: "login",
          resource: "auth",
          details: { login: input.login },
          ipAddress,
          userAgent,
          success: true,
        });

        return {
          success: true,
          user: {
            id: adminUser.id,
            login: adminUser.login,
            name: adminUser.name,
            role: adminUser.role,
            type: "admin" as const,
          },
        };
      }

      // Student login
      const localUser = await findLocalUserByLogin(input.login);
      if (!localUser) {
        await createAuditEntry({
          actorId: 0,
          actorType: "local_user",
          action: "login",
          resource: "auth",
          details: { login: input.login, reason: "user_not_found" },
          ipAddress,
          userAgent,
          success: false,
          errorMessage: "Invalid login or password",
        });
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid login or password",
        });
      }

      if (localUser.status === "suspended") {
        await createAuditEntry({
          actorId: localUser.id,
          actorType: "local_user",
          action: "login",
          resource: "auth",
          details: { login: input.login, reason: "account_suspended" },
          ipAddress,
          userAgent,
          success: false,
          errorMessage: "Account suspended",
        });
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Account suspended. Contact your teacher.",
        });
      }

      if (localUser.status === "inactive") {
        await createAuditEntry({
          actorId: localUser.id,
          actorType: "local_user",
          action: "login",
          resource: "auth",
          details: { login: input.login, reason: "account_inactive" },
          ipAddress,
          userAgent,
          success: false,
          errorMessage: "Account is inactive",
        });
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Account is inactive",
        });
      }

      const passwordValid = await comparePassword(
        input.password,
        localUser.passwordHash
      );
      if (!passwordValid) {
        await createAuditEntry({
          actorId: localUser.id,
          actorType: "local_user",
          action: "login",
          resource: "auth",
          details: { login: input.login, reason: "invalid_password" },
          ipAddress,
          userAgent,
          success: false,
          errorMessage: "Invalid login or password",
        });
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid login or password",
        });
      }

      const role = await getRoleWithPermissions(localUser.roleId);
      await updateLocalUserLastLogin(localUser.id);

      const cookieStr = await getStudentSetCookie(
        { localUserId: localUser.id, login: localUser.login, type: "student" },
        ctx.req.headers
      );
      ctx.resHeaders.append("set-cookie", cookieStr);

      await createAuditEntry({
        actorId: localUser.id,
        actorType: "local_user",
        action: "login",
        resource: "auth",
        details: { login: input.login },
        ipAddress,
        userAgent,
        success: true,
      });

      return {
        success: true,
        user: {
          id: localUser.id,
          login: localUser.login,
          name: localUser.name,
          role: role?.name ?? "student",
          type: "student" as const,
        },
      };
    }),

  /**
   * Get current authenticated actor (admin or student).
   */
  me: publicQuery.query(async ({ ctx }) => {
    if (ctx.adminUser) {
      return {
        type: "admin" as const,
        id: ctx.adminUser.id,
        login: ctx.adminUser.login,
        name: ctx.adminUser.name,
        role: ctx.adminUser.role,
        status: ctx.adminUser.status,
        permissions: [],
        avatar: ctx.adminUser.avatar ?? null,
      };
    }

    if (ctx.localUser) {
      return {
        type: "student" as const,
        id: ctx.localUser.id,
        login: ctx.localUser.login,
        name: ctx.localUser.name,
        status: ctx.localUser.status,
        role: ctx.role?.name ?? "student",
        permissions: ctx.role?.permissions ?? [],
        avatar: ctx.localUser.avatar ?? null,
      };
    }

    return null;
  }),

  /**
   * Logout — clears all session cookies.
   */
  logout: publicQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append("set-cookie", getStudentClearCookie(ctx.req.headers));
    ctx.resHeaders.append("set-cookie", getAdminClearCookie(ctx.req.headers));
    return { success: true };
  }),
});
