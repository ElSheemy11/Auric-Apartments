import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { listMyListings } from "@/server/queries/listings";
import { type ListingView } from "@/types/listing";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ locale: string }> };

/**
 * Owner dashboard placeholder: my listings. Create/edit/publish actions are the
 * UI owner's responsibility; data comes from the real queries (stubbed in Step 1).
 */
export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const user = await requireUser();
  const listings: ListingView[] = await listMyListings(user.id);

  return (
    <main>
      <h1>{t("dashboard.title")}</h1>
      {/* TODO(ui): my-listings grid with edit / publish / mark rented-sold / renew actions */}
      {listings.length === 0 ? (
        <p>{t("dashboard.noListings")}</p>
      ) : (
        <p>{listings.length} listings</p>
      )}
    </main>
  );
}