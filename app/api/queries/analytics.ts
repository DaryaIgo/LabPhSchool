/**
 * Analytics Query Functions — Self-hosted visit statistics.
 */

import { and, desc, gte, lte, count, sql, lt } from "drizzle-orm";
import { startOfDay, subDays } from "date-fns";
import { getAnalyticsDb } from "./connection";
import { pageVisits } from "@db/schema/analytics";

export async function createPageVisit(data: {
  path: string;
  referrer?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  localUserId?: number | null;
}) {
  return getAnalyticsDb()
    .insert(pageVisits)
    .values({
      path: data.path,
      referrer: data.referrer ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      localUserId: data.localUserId ?? null,
    });
}

const uniqueVisitorExpr = sql<number>`COUNT(DISTINCT CONCAT(COALESCE(${pageVisits.ipAddress}, ""), "::", COALESCE(${pageVisits.userAgent}, "")))`;

export async function getPageVisitStats() {
  const db = getAnalyticsDb();
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));

  const [totalResult] = await db.select({ count: count() }).from(pageVisits);

  const [todayResult] = await db
    .select({ count: count() })
    .from(pageVisits)
    .where(gte(pageVisits.visitedAt, todayStart));

  const [yesterdayResult] = await db
    .select({ count: count() })
    .from(pageVisits)
    .where(
      and(
        gte(pageVisits.visitedAt, yesterdayStart),
        lte(pageVisits.visitedAt, todayStart)
      )
    );

  const [uniqueResult] = await db
    .select({ count: uniqueVisitorExpr })
    .from(pageVisits);

  return {
    totalVisits: totalResult.count,
    todayVisits: todayResult.count,
    yesterdayVisits: yesterdayResult.count,
    uniqueVisitors: uniqueResult.count,
  };
}

export async function getVisitsByDay(days = 14) {
  const db = getAnalyticsDb();
  const since = startOfDay(subDays(new Date(), days - 1));

  return db
    .select({
      date: sql<string>`DATE(${pageVisits.visitedAt})`,
      visits: count(),
      uniqueVisitors: uniqueVisitorExpr,
    })
    .from(pageVisits)
    .where(gte(pageVisits.visitedAt, since))
    .groupBy(sql`DATE(${pageVisits.visitedAt})`)
    .orderBy(sql`DATE(${pageVisits.visitedAt})`);
}

export async function getTopPages(limit = 10) {
  const db = getAnalyticsDb();
  const visitsCount = count();

  return db
    .select({
      path: pageVisits.path,
      visits: visitsCount,
    })
    .from(pageVisits)
    .groupBy(pageVisits.path)
    .orderBy(desc(visitsCount))
    .limit(limit);
}

export async function getRecentVisits(limit = 20) {
  const db = getAnalyticsDb();

  return db
    .select()
    .from(pageVisits)
    .orderBy(desc(pageVisits.visitedAt))
    .limit(limit);
}

export async function cleanupOldPageVisits(days = 30) {
  const db = getAnalyticsDb();
  const cutoff = subDays(new Date(), days);

  return db.delete(pageVisits).where(lt(pageVisits.visitedAt, cutoff));
}
