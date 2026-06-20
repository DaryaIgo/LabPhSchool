import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";

// Domain schemas
import * as authSchema from "@db/schema/auth";
import * as contentSchema from "@db/schema/content";
import * as learningSchema from "@db/schema/learning";
import * as labsSchema from "@db/schema/labs";
import * as problemsSchema from "@db/schema/problems";
import * as jupyterSchema from "@db/schema/jupyter";
import * as notificationsSchema from "@db/schema/notifications";
import * as timelineSchema from "@db/schema/timeline";
import * as auditSchema from "@db/schema/audit";
import * as mediaSchema from "@db/schema/media";

// Domain relations
import * as authRelations from "@db/schema/relations/auth";
import * as labsRelations from "@db/schema/relations/labs";
import * as problemsRelations from "@db/schema/relations/problems";
import * as jupyterRelations from "@db/schema/relations/jupyter";

// Backward compatibility: full schema used by legacy code paths.
import * as fullSchemaModule from "@db/schema";
import * as fullRelationsModule from "@db/relations";

const fullSchema = { ...fullSchemaModule, ...fullRelationsModule };

const poolCache = new Map<string, mysql.Pool>();

function getPool(url: string): mysql.Pool {
  if (!poolCache.has(url)) {
    poolCache.set(url, mysql.createPool(url));
  }
  return poolCache.get(url)!;
}

function createDomainDb<TSchema extends Record<string, unknown>>(
  url: string,
  schema: TSchema
) {
  return drizzle(getPool(url), {
    mode: "default",
    schema,
  });
}

// ═══════════════════════════════════════════════════════════════
// Domain-specific database factories
// ═══════════════════════════════════════════════════════════════

const authSchemaWithRelations = { ...authSchema, ...authRelations };
let authDb: ReturnType<typeof createDomainDb<typeof authSchemaWithRelations>> | undefined;
export function getAuthDb() {
  if (!authDb) {
    authDb = createDomainDb(env.databaseUrls.auth, authSchemaWithRelations);
  }
  return authDb;
}

let contentDb: ReturnType<typeof createDomainDb<typeof contentSchema>> | undefined;
export function getContentDb() {
  if (!contentDb) {
    contentDb = createDomainDb(env.databaseUrls.content, contentSchema);
  }
  return contentDb;
}

let learningDb: ReturnType<typeof createDomainDb<typeof learningSchema>> | undefined;
export function getLearningDb() {
  if (!learningDb) {
    learningDb = createDomainDb(env.databaseUrls.learning, learningSchema);
  }
  return learningDb;
}

const labsSchemaWithRelations = { ...labsSchema, ...labsRelations };
let labsDb: ReturnType<typeof createDomainDb<typeof labsSchemaWithRelations>> | undefined;
export function getLabsDb() {
  if (!labsDb) {
    labsDb = createDomainDb(env.databaseUrls.labs, labsSchemaWithRelations);
  }
  return labsDb;
}

const problemsSchemaWithRelations = { ...problemsSchema, ...problemsRelations };
let problemsDb: ReturnType<typeof createDomainDb<typeof problemsSchemaWithRelations>> | undefined;
export function getProblemsDb() {
  if (!problemsDb) {
    problemsDb = createDomainDb(env.databaseUrls.problems, problemsSchemaWithRelations);
  }
  return problemsDb;
}

const jupyterSchemaWithRelations = { ...jupyterSchema, ...jupyterRelations };
let jupyterDb: ReturnType<typeof createDomainDb<typeof jupyterSchemaWithRelations>> | undefined;
export function getJupyterDb() {
  if (!jupyterDb) {
    jupyterDb = createDomainDb(env.databaseUrls.jupyter, jupyterSchemaWithRelations);
  }
  return jupyterDb;
}

let notificationsDb: ReturnType<typeof createDomainDb<typeof notificationsSchema>> | undefined;
export function getNotificationsDb() {
  if (!notificationsDb) {
    notificationsDb = createDomainDb(env.databaseUrls.notifications, notificationsSchema);
  }
  return notificationsDb;
}

let timelineDb: ReturnType<typeof createDomainDb<typeof timelineSchema>> | undefined;
export function getTimelineDb() {
  if (!timelineDb) {
    timelineDb = createDomainDb(env.databaseUrls.timeline, timelineSchema);
  }
  return timelineDb;
}

let auditDb: ReturnType<typeof createDomainDb<typeof auditSchema>> | undefined;
export function getAuditDb() {
  if (!auditDb) {
    auditDb = createDomainDb(env.databaseUrls.audit, auditSchema);
  }
  return auditDb;
}

let mediaDb: ReturnType<typeof createDomainDb<typeof mediaSchema>> | undefined;
export function getMediaDb() {
  if (!mediaDb) {
    mediaDb = createDomainDb(env.databaseUrls.media, mediaSchema);
  }
  return mediaDb;
}

// ═══════════════════════════════════════════════════════════════
// Legacy singleton (deprecated — prefer domain factories above)
// ═══════════════════════════════════════════════════════════════

let legacyDb: ReturnType<typeof createDomainDb<typeof fullSchema>> | undefined;

export function getDb() {
  if (!legacyDb) {
    legacyDb = createDomainDb(env.databaseUrl, fullSchema);
  }
  return legacyDb;
}
