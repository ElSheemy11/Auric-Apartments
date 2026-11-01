import { MetadataRoute } from "next";
import { searchListings } from "@/server/queries/listings";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["ar", "en"] as const;
  const base = siteUrl.replace(/\/$/, "");

  const staticRoutes = locales.flatMap((locale) => [
    {
      url: `${base}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 1,
    },
    {
      url: `${base}/${locale}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 0.8,
    },
  ]);

  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    // Listing URLs are added once the DB is available (Step 2 migrations).
    const listings = await searchListings({ page: 1, pageSize: 1000 });
    listingRoutes = listings.items.flatMap((item) =>
      locales.map((locale) => ({
        url: `${base}/${locale}/listings/${item.slug}`,
        lastModified: item.createdAt,
        changeFrequency: "weekly" as ChangeFrequency,
        priority: 0.7,
      })),
    );
  } catch {
    // No database configured yet — skip listing URLs.
  }

  return [...staticRoutes, ...listingRoutes];
}