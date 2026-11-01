import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { searchListings } from "@/server/queries/listings";
import { listingFiltersSchema } from "@/lib/validators/listing";
import { type ListingFilters } from "@/types/listing";

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

function normalizeSearchParams(raw: SearchParams): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = Array.isArray(value) ? (value[0] ?? "") : value ?? "";
  }
  return normalized;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return {
    title: t("listings.title"),
    alternates: { languages: { en: "/en/listings", ar: "/ar/listings" } },
  };
}

/**
 * Listings page placeholder. Filter UI, sorting and the results grid are the
 * UI owner's responsibility; this shell calls the real searchListings query
 * (stub in Step 1, Neon/Drizzle implementation in Step 2).
 */
export default async function ListingsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const raw = await searchParams;
  const filters = listingFiltersSchema.parse(normalizeSearchParams(raw)) as ListingFilters;
  const page = await searchListings(filters);

  return (
    <main>
      <h1>{t("listings.title")}</h1>
      {/* TODO(ui): filter controls, sort selector, results grid from page.items */}
      {page.total === 0 ? (
        <p>{t("listings.noListings")}</p>
      ) : (
        <p>{page.items.length} listings</p>
      )}
    </main>
  );
}