import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  rows: [] as unknown[][], // queue: each db query takes the next entry
  userId: null as string | null,
}));

vi.mock("server-only", () => ({}));
vi.mock("react", () => ({ cache: <T,>(fn: T) => fn }));
vi.mock("@/i18n/routing", () => ({ routing: { defaultLocale: "ar" } }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: h.userId }),
  currentUser: async () => null,
}));
vi.mock("@/server/db", () => {
  const chain = {
    from: () => chain,
    where: () => chain,
    limit: async () => h.rows.shift() ?? [],
  };
  return { db: { select: () => chain } };
});

import { requireAdmin, requireOwnerOf, requireUser } from "./auth";

const userRow = (over: Record<string, unknown> = {}) => ({
  id: "user-a",
  clerkId: "clerk-a",
  name: "A",
  email: "a@example.com",
  imageUrl: null,
  isAdmin: false,
  isSuspended: false,
  ...over,
});

beforeEach(() => {
  h.rows = [];
  h.userId = "clerk-a";
});

describe("requireUser", () => {
  it("redirects anonymous visitors to sign-in", async () => {
    h.userId = null;
    await expect(requireUser()).rejects.toThrow("REDIRECT:/ar/sign-in");
  });
  it("blocks suspended users", async () => {
    h.rows = [[userRow({ isSuspended: true })]];
    await expect(requireUser()).rejects.toThrow("suspended");
  });
  it("returns an active user", async () => {
    h.rows = [[userRow()]];
    await expect(requireUser()).resolves.toMatchObject({ id: "user-a" });
  });
});

describe("requireAdmin", () => {
  it("rejects a normal user", async () => {
    h.rows = [[userRow()]];
    await expect(requireAdmin()).rejects.toThrow("forbidden");
  });
  it("accepts an admin", async () => {
    h.rows = [[userRow({ isAdmin: true })]];
    await expect(requireAdmin()).resolves.toMatchObject({ isAdmin: true });
  });
});

describe("requireOwnerOf", () => {
  it("allows the owner", async () => {
    h.rows = [[userRow()], [{ ownerId: "user-a" }]];
    await expect(requireOwnerOf("p1")).resolves.toMatchObject({ id: "user-a" });
  });
  it("blocks a different user (user B editing user A's listing)", async () => {
    h.userId = "clerk-b";
    h.rows = [[userRow({ id: "user-b", clerkId: "clerk-b" })], [{ ownerId: "user-a" }]];
    await expect(requireOwnerOf("p1")).rejects.toThrow("forbidden");
  });
  it("gives the same error for a listing that doesn't exist", async () => {
    h.rows = [[userRow()], []];
    await expect(requireOwnerOf("missing")).rejects.toThrow("forbidden");
  });
  it("blocks a suspended owner", async () => {
    h.rows = [[userRow({ isSuspended: true })]];
    await expect(requireOwnerOf("p1")).rejects.toThrow("suspended");
  });
});