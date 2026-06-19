import type { CookieOptions } from "hono/utils/cookie";

/**
 * Session cookie options.
 *
 * Important: the test mirror is served over HTTP, so we must not set
 * `Secure: true`. Modern browsers reject cookies with `Secure` over HTTP,
 * and `SameSite: "None"` also requires `Secure`. We use `SameSite: "Lax"`
 * which works for both HTTP and HTTPS in normal same-site navigation.
 */
export function getSessionCookieOptions(_headers?: Headers): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: false,
  };
}
