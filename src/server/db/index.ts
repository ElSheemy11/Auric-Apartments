import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }
    const sql = neon(connectionString);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

// Lazily initialized so the module can be imported without a live database
// (e.g. during `next build` page-data collection). A missing DATABASE_URL
// surfaces as a runtime error, not a build-time import failure.
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop: string) {
    const value = getDb()[prop as keyof ReturnType<typeof drizzle>];
    if (typeof value === "function") return value.bind(getDb());
    return value;
  },
}) as ReturnType<typeof drizzle>;

