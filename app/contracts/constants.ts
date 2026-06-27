export const Session = {
  cookieName: "auth_session",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
} as const;

/**
 * Допустимые значения для lab_categories.icon_type.
 * Должен совпадать с ключами из CATEGORY_ICONS (app/src/lib/lab-icons.ts).
 */
export const LAB_CATEGORY_ICON_KEYS = [
  "mechanics",
  "fluid-mechanics",
  "molecular-thermodynamics",
  "thermal",
  "electrodynamics",
  "circuit",
  "optics",
  "nuclear-physics",
  "atomic",
  "magnetism",
  "waves",
  "oscillations",
] as const;
