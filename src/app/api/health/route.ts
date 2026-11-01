import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Lazily imported so the route module can be collected without a live
    // database; a missing DATABASE_URL surfaces here as a graceful 500.
    const { db } = await import("@/server/db");
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: "ok", db: true });
  } catch {
    return NextResponse.json(
      { status: "error", db: false },
      { status: 500 },
    );
  }
}