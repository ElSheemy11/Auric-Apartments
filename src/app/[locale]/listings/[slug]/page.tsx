import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatPriceEGP, formatAreaM2 } from "@/lib/format";
import { getListingBySlug } from "@/server/queries/listings";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return {
    title: t("listing.title"),
    description: t("listing.description"),
    alternates: { languages: { en: "/en", ar: "/ar" } },
  };
}

/**
 * Listing detail page placeholder. Gallery, amenities map, save button and the
 * "show contact" trigger are the UI owner's responsibility; this shell renders
 * the real listing from getListingBySlug (stub in Step 1, Step 2 implementation).
 */
export default async function ListingPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const listing = await getListingBySlug(await slug);
  if (!listing) notFound();

  return (
    <main>
      <h1>{listing.title}</h1>
      <p>{listing.description}</p>
      <p>{t("listing.price", { price: formatPriceEGP(listing.price, locale) })}</p>
      <p>{t("listing.area", { area: formatAreaM2(listing.areaM2, locale) })}</p>
      <p>{t("listing.neighborhood", { neighborhood: listing.neighborhood })}</p>
      {/* TODO(ui): image gallery, amenities, map, save button,
          "show contact" button wired to revealContact server action */}
    </main>
  );
}