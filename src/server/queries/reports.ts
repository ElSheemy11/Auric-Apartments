import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { properties, reports, users, type Property, type Report } from "@/server/db/schema";
import { type ReportView } from "@/types/listing";

export async function listReports(): Promise<ReportView[]> {
  const rows = await db
    .select({
      id: reports.id,
      propertyId: reports.propertyId,
      reporterId: reports.reporterId,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      propertySlug: properties.slug,
      propertyTitle: properties.title,
      propertyStatus: properties.status,
    })
    .from(reports)
    .innerJoin(properties, eq(reports.propertyId, properties.id))
    .orderBy(desc(reports.createdAt));

  return rows.map((r) => ({
    id: r.id,
    propertyId: r.propertyId,
    reporterId: r.reporterId,
    reason: r.reason as ReportView["reason"],
    details: r.details,
    status: r.status as ReportView["status"],
    createdAt: r.createdAt,
  }));
}

export async function getReport(id: string): Promise<ReportView | null> {
  const [row] = await db
    .select({
      id: reports.id,
      propertyId: reports.propertyId,
      reporterId: reports.reporterId,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);
  if (!row) return null;
  return {
    id: row.id,
    propertyId: row.propertyId,
    reporterId: row.reporterId,
    reason: row.reason as ReportView["reason"],
    details: row.details,
    status: row.status as ReportView["status"],
    createdAt: row.createdAt,
  };
}