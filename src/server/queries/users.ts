import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users, type User } from "@/server/db/schema";
import { type UserView } from "@/types/listing";

function toUserView(row: User): UserView {
  return {
    id: row.id,
    clerkId: row.clerkId,
    name: row.name,
    email: row.email,
    isAdmin: row.isAdmin,
    isSuspended: row.isSuspended,
    createdAt: row.createdAt,
  };
}

export async function getUserByClerkId(clerkId: string): Promise<UserView | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return row ? toUserView(row) : null;
}

export async function listUsers(): Promise<UserView[]> {
  const rows = await db.select().from(users);
  return rows.map(toUserView);
}

export async function getUser(id: string): Promise<UserView | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ? toUserView(row) : null;
}