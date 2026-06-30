/**
 * Admin Session Management — JWT in HttpOnly Cookies
 *
 * Security: JWT tokens are stored in httpOnly, SameSite=Lax, Secure cookies.
 */

import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "./lib/env";
import { getSessionCookieOptions } from "./lib/cookies";

const JWT_ALG = "HS256";
const ADMIN_COOKIE_NAME = "admin_session";

export type AdminSessionPayload = {
  adminUserId: number;
  login: string;
  type: "admin";
};

export async function signAdminSession(
  payload: AdminSessionPayload
): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyAdminSession(
  headers: Headers
): Promise<AdminSessionPayload | null> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[ADMIN_COOKIE_NAME];
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });
    if (payload.type !== "admin" || !payload.adminUserId || !payload.login) {
      return null;
    }
    return {
      adminUserId: payload.adminUserId as number,
      login: payload.login as string,
      type: "admin",
    };
  } catch {
    return null;
  }
}

export async function getAdminSetCookie(
  payload: AdminSessionPayload,
  headers: Headers
): Promise<string> {
  const token = await signAdminSession(payload);
  const opts = getSessionCookieOptions(headers);
  return cookie.serialize(ADMIN_COOKIE_NAME, token, {
    ...(opts as Record<string, unknown>),
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function getAdminClearCookie(headers: Headers): string {
  const opts = getSessionCookieOptions(headers);
  return cookie.serialize(ADMIN_COOKIE_NAME, "", {
    ...(opts as Record<string, unknown>),
    maxAge: 0,
  });
}

export { ADMIN_COOKIE_NAME };
