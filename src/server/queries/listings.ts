import "server-only";
import { and, asc, desc, eq, gt, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { properties, propertyImages } from "@/server/db/schema";
import { listingFiltersSchema } from "@/lib/validators/listing";
import { type ListingsPage, type ListingView } from "@/types/listing";

// Public visibility, enforced here and never in the client:
// active + published + not expired.
const publicWhere = and(
  eq(properties.status, "active"),
  eq(properties.isPublished, true),
  gt(properties.expiresAt, sql`now()`),
);

// First image by position, taken inside the same query (no duplicate rows).
const coverImage = sql<string | null>`(
  select ${propertyImages.url}
  from ${propertyImages}
  where ${propertyImages.propertyId} = ${properties.id}
  order by ${propertyImages.position} asc
  limit 1
)`;

const listingColumns = {
  id: properties.id,
  slug: properties.slug,
  title: properties.title,
  description: properties.description,
  propertyType: properties.propertyType,
  listingType: properties.listingType,
  price: properties.price,
  billingPeriod: properties.billingPeriod,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
  areaM2: properties.areaM2,
  furnished: properties.furnished,
  genderPreference: properties.genderPreference,
  distanceToUniversityKm: properties.distanceToUniversityKm,
  neighborhood: properties.neighborhood,
  city: properties.city,
  address: properties.address,
  coverImage,
  status: properties.status,
  isPublished: properties.isPublished,
  isVerified: properties.isVerified,
  createdAt: properties.createdAt,
};

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function searchListings(input: unknown): Promise<ListingsPage> {
  // Bad query-string values fall back to defaults instead of crashing the page.
  const result = listingFiltersSchema.safeParse(input);
  const f = result.success ? result.data : listingFiltersSchema.parse({});

  const where = and(
    publicWhere,
    f.listingType ? eq(properties.listingType, f.listingType) : undefined,
    f.propertyType ? eq(properties.propertyType, f.propertyType) : undefined,
    f.minPrice !== undefined ? gte(properties.price, f.minPrice) : undefined,
    f.maxPrice !== undefined ? lte(properties.price, f.maxPrice) : undefined,
    f.bedrooms !== undefined ? gte(properties.bedrooms, f.bedrooms) : undefined,
    f.furnished !== undefined ? eq(properties.furnished, f.furnished) : undefined,
    f.genderPreference && f.genderPreference !== "any"
      ? or(
          eq(properties.genderPreference, f.genderPreference),
          eq(properties.genderPreference, "any"),
        )
      : undefined,
    f.neighborhood
      ? ilike(properties.neighborhood, escapeLike(f.neighborhood))
      : undefined,
    f.maxDistanceKm !== undefined
      ? lte(properties.distanceToUniversityKm, String(f.maxDistanceKm))
      : undefined,
    // or(...) wraps itself in parentheses, so it can't escape the AND chain.
    f.q
      ? or(
          ilike(properties.title, `%${escapeLike(f.q)}%`),
          ilike(properties.neighborhood, `%${escapeLike(f.q)}%`),
          ilike(properties.address, `%${escapeLike(f.q)}%`),
        )
      : undefined,
  );

  const orderBy =
    f.sort === "price_asc"
      ? [asc(properties.price), asc(properties.id)]
      : f.sort === "price_desc"
        ? [desc(properties.price), asc(properties.id)]
        : [desc(properties.createdAt), asc(properties.id)];

  const [items, [{ total }]] = await Promise.all([
    db
      .select(listingColumns)
      .from(properties)
      .where(where)
      .orderBy(...orderBy)
      .limit(f.pageSize)
      .offset((f.page - 1) * f.pageSize),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(properties)
      .where(where),
  ]);

  return { items, total, page: f.page, pageSize: f.pageSize };
}

export async function getListingBySlug(
  slug: string,
  viewerId?: string, // users.id of the logged-in viewer
): Promise<ListingView | null> {
  const [publicRow] = await db
    .select(listingColumns)
    .from(properties)
    .where(and(eq(properties.slug, slug), publicWhere))
    .limit(1);
  if (publicRow) return publicRow;

  // Owners may open their own listing in any status (drafts, rented, ...).
  if (viewerId) {
    const [ownRow] = await db
      .select(listingColumns)
      .from(properties)
      .where(and(eq(properties.slug, slug), eq(properties.ownerId, viewerId)))
      .limit(1);
    if (ownRow) return ownRow;
  }
  return null;
}

export async function listMyListings(ownerId: string): Promise<ListingView[]> {
  return db
    .select(listingColumns)
    .from(properties)
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(properties.createdAt), asc(properties.id));
}

// Homepage: verified listings first, then newest.
export async function getFeaturedListings(limit = 6): Promise<ListingView[]> {
  return db
    .select(listingColumns)
    .from(properties)
    .where(publicWhere)
    .orderBy(desc(properties.isVerified), desc(properties.createdAt))
    .limit(limit);
}

// Options for the search box, taken from real public listings.
export async function getNeighborhoods(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ name: properties.neighborhood })
    .from(properties)
    .where(publicWhere)
    .orderBy(asc(properties.neighborhood));
  return rows.map((r) => r.name);
}