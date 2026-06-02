/**
 * Unified Authentication Router
 *
 * Single login endpoint that handles both student (password) and
 * admin (OAuth redirect) authentication flows.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import {
  findLocalUserByLogin,
  updateLocalUserLastLogin,
} from "./queries/localUsers";
import { comparePassword } from "./lib/password";
import {
  getStudentSetCookie,
  getStudentClearCookie,
} from "./student-session";
import { getRoleWithPermissions } from "./queries/roles";
import { createAuditEntry } from "./queries/audit";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";

export const unifiedAuthRouter = createRouter({
  /**
   * Unified login — accepts credentials and returns JWT in HttpOnly cookie.
   * For students: { login, password, type: "student" }
   */
  login: publicQuery
    .input(
      z.object({
        login: z.string().min(1).max(100),
        password: z.string().min(1).max(128),
        type: z.enum(["student"]).default("student"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ipAddress =
        ctx.req.headers.get("x-forwarded-for") ??
        ctx.req.headers.get("x-real-ip") ??
        "unknown";
      const userAgent = ctx.req.headers.get("user-agent") ?? "unknown";

      // Find student by login
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

      // Check account status
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

      // Verify password with bcrypt (timing-safe)
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

      // Load role with permissions
      const role = await getRoleWithPermissions(localUser.roleId);

      // Update last login
      await updateLocalUserLastLogin(localUser.id);

      // Set HttpOnly cookie
      const cookieStr = await getStudentSetCookie(
        { localUserId: localUser.id, login: localUser.login, type: "student" },
        ctx.req.headers
      );
      ctx.resHeaders.append("set-cookie", cookieStr);

      // Audit log
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
        student: {
          id: localUser.id,
          login: localUser.login,
          name: localUser.name,
          role: role?.name ?? "student",
        },
      };
    }),

  /**
   * Get current authenticated actor (OAuth user or local student).
   */
  me: publicQuery.query(async ({ ctx }) => {
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
    // Clear student session cookie
    const studentClearCookie = getStudentClearCookie(ctx.req.headers);
    ctx.resHeaders.append("set-cookie", studentClearCookie);

    // Clear OAuth session cookie if present
    const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
    if (cookies[Session.cookieName]) {
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, "", {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: 0,
        })
      );
    }

    return { success: true };
  }),
});
