import "server-only";
import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { db } from "@/server/db";
import { properties, users } from "@/server/db/schema";

export type ViewUser = {
  id: string; // users.id (database UUID)
  clerkId: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  isSuspended: boolean;
};

function signInUrl(): string {
  return `/${routing.defaultLocale}/sign-in`;
}

function toViewUser(row: typeof users.$inferSelect): ViewUser {
  return {
    id: row.id,
    clerkId: row.clerkId,
    name: row.name,
    email: row.email,
    imageUrl: row.imageUrl,
    isAdmin: row.isAdmin,
    isSuspended: row.isSuspended,
  };
}

export const getCurrentUser = cache(async (): Promise<ViewUser | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);
  if (existing) return toViewUser(existing);

  // First authenticated request: sync from Clerk. Admin is never set here.
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [created] = await db
    .insert(users)
    .values({
      clerkId: userId,
      name: clerkUser.fullName ?? null,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
      imageUrl: clerkUser.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { name: clerkUser.fullName ?? null },
    })
    .returning();
  return toViewUser(created);
});

export async function requireUser(): Promise<ViewUser> {
  const user = await getCurrentUser();
  if (!user) redirect(signInUrl());
  if (user.isSuspended) throw new Error("suspended");
  return user;
}

export async function requireAdmin(): Promise<ViewUser> {
  const user = await requireUser();
  if (!user.isAdmin) throw new Error("forbidden");
  return user;
}

export async function requireOwnerOf(propertyId: string): Promise<ViewUser> {
  const user = await requireUser();
  const [row] = await db
    .select({ ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  // Same error for "not found" and "not yours" so IDs can't be probed.
  if (row?.ownerId !== user.id) throw new Error("forbidden");
  return user;
}