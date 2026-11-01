import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { createListing } from "@/server/actions/listings";

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * New listing page placeholder. The create form (max 10 images, 5 MB each,
 * ImageKit upload) is the UI owner's responsibility; this shell gates access
 * and imports the real createListing server action.
 */
export default async function NewListingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  await requireUser();
  // createListing is imported so the form (UI, step 6+) can wire to it.
  void createListing;

  return (
    <main>
      <h1>{t("dashboard.newListing")}</h1>
      {/* TODO(ui): create listing form wired to createListing server action */}
    </main>
  );
}