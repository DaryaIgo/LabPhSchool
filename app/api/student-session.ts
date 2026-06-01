/**
 * Student Session Management — JWT in HttpOnly Cookies
 *
 * Security: JWT tokens are stored in httpOnly, SameSite=Lax, Secure cookies.
 * This prevents XSS attacks from stealing session tokens.
 *
 * Replaces the previous localStorage-based approach.
 */

import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "./lib/env";
import { getSessionCookieOptions } from "./lib/cookies";

const JWT_ALG = "HS256";
const STUDENT_COOKIE_NAME = "student_session";

export type StudentSessionPayload = {
  localUserId: number;
  login: string;
  type: "student";
};

/**
 * Sign a student session JWT.
 */
export async function signStudentSession(
  payload: StudentSessionPayload
): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

/**
 * Verify a student session JWT from request headers.
 */
export async function verifyStudentSession(
  headers: Headers
): Promise<StudentSessionPayload | null> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[STUDENT_COOKIE_NAME];
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });
    if (
      payload.type !== "student" ||
      !payload.localUserId ||
      !payload.login
    ) {
      return null;
    }
    return {
      localUserId: payload.localUserId as number,
      login: payload.login as string,
      type: "student",
    };
  } catch {
    return null;
  }
}

/**
 * Get the Set-Cookie header value for setting a student session.
 */
export async function getStudentSetCookie(
  payload: StudentSessionPayload,
  headers: Headers
): Promise<string> {
  const token = await signStudentSession(payload);
  const opts = getSessionCookieOptions(headers);
  return cookie.serialize(STUDENT_COOKIE_NAME, token, {
    ...(opts as Record<string, unknown>),
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Get the Set-Cookie header value for clearing a student session.
 */
export function getStudentClearCookie(headers: Headers): string {
  const opts = getSessionCookieOptions(headers);
  return cookie.serialize(STUDENT_COOKIE_NAME, "", {
    ...(opts as Record<string, unknown>),
    maxAge: 0,
  });
}

export { STUDENT_COOKIE_NAME };
