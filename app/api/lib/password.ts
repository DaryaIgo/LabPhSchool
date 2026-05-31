/**
 * Password Service — Secure password hashing using bcryptjs
 *
 * Security: Uses bcrypt with cost factor 12 (OWASP recommended minimum).
 * Replaces the previous SHA-256 + salt approach which is vulnerable to
 * rainbow table attacks and GPU-accelerated brute force.
 */

import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

/**
 * Hash a plaintext password using bcrypt.
 * @param password Plaintext password (8-128 characters recommended)
 * @returns bcrypt hash string ($2a$12$...)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * Uses timing-safe comparison internally.
 * @param password Plaintext password
 * @param hash bcrypt hash from database
 * @returns true if password matches
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength.
 * @param password Password to validate
 * @returns Validation result with optional error message
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (password.length > 128) {
    return {
      valid: false,
      message: "Password must not exceed 128 characters",
    };
  }
  // At least one uppercase, one lowercase, one digit
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one digit",
    };
  }
  return { valid: true };
}
