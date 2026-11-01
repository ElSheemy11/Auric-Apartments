import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { rateLimits, contactReveals } from "@/server/db/schema";

/**
 * Simple DB-backed rate limiter. Choice: Neon table `rate_limits`
 * (identifier + window_seconds) instead of Upstash, since no Upstash is
 * configured in this project. Sliding window per (identifier, window).
 */
export async function checkRateLimit(
  identifier: string,
  windowSeconds: number,
  maxRequests: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  const now = new Date();
  const [existing] = await db
    .select()
    .from(rateLimits)
    .where(
      and(eq(rateLimits.identifier, identifier), eq(rateLimits.windowSeconds, windowSeconds)),
    )
    .limit(1);

  if (existing) {
    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: existing.expiresAt.toISOString() };
    }
    await db
      .update(rateLimits)
      .set({ count: existing.count + 1 })
      .where(eq(rateLimits.id, existing.id));
    return {
      allowed: true,
      remaining: maxRequests - existing.count - 1,
      resetAt: existing.expiresAt.toISOString(),
    };
  }

  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
  await db.insert(rateLimits).values({
    identifier,
    windowSeconds,
    count: 1,
    expiresAt,
  });
  return { allowed: true, remaining: maxRequests - 1, resetAt: expiresAt.toISOString() };
}

export async function listContactReveals(propertyId: string) {
  const rows = await db
    .select()
    .from(contactReveals)
    .where(eq(contactReveals.propertyId, propertyId))
    .orderBy(contactReveals.createdAt);
  return rows;
}