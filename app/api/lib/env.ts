import { config } from "dotenv";

config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

const databaseUrl = required("DATABASE_URL");

export const env = {
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl,
  // Optional per-domain connection strings. When not provided, each domain
  // falls back to the shared DATABASE_URL (keeps SprintHost compatibility).
  databaseUrls: {
    auth: optional("DATABASE_URL_AUTH") ?? databaseUrl,
    content: optional("DATABASE_URL_CONTENT") ?? databaseUrl,
    learning: optional("DATABASE_URL_LEARNING") ?? databaseUrl,
    labs: optional("DATABASE_URL_LABS") ?? databaseUrl,
    problems: optional("DATABASE_URL_PROBLEMS") ?? databaseUrl,
    jupyter: optional("DATABASE_URL_JUPYTER") ?? databaseUrl,
    notifications: optional("DATABASE_URL_NOTIFICATIONS") ?? databaseUrl,
    timeline: optional("DATABASE_URL_TIMELINE") ?? databaseUrl,
    audit: optional("DATABASE_URL_AUDIT") ?? databaseUrl,
    media: optional("DATABASE_URL_MEDIA") ?? databaseUrl,
    analytics: optional("DATABASE_URL_ANALYTICS") ?? databaseUrl,
  },
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};
