import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireOwnerOf } from "@/lib/auth";
import { getListingBySlug } from "@/server/queries/listings";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Edit listing page placeholder. Form is the UI owner's responsibility; this
 * shell verifies ownership via requireOwnerOf before rendering.
 */
export default async function EditListingPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  await requireOwnerOf(id);
  const listing = await getListingBySlug("");
  if (!listing) notFound();

  return (
    <main>
      <h1>{t("dashboard.edit")}</h1>
      <p>{listing.title}</p>
      {/* TODO(ui): edit form wired to updateListing server action (owner only) */}
    </main>
  );
}