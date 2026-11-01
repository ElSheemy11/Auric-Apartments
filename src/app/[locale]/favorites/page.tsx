import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { listFavorites } from "@/server/queries/favorites";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ locale: string }> };

/**
 * Favorites page placeholder. Requires a signed-in user; favorite cards are the
 * UI owner's responsibility; data from listFavorites (stubbed in Step 1).
 */
export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  await requireUser();
  const favorites = await listFavorites(""); // TODO(step-2): current user id

  return (
    <main>
      <h1>{t("nav.favorites")}</h1>
      {/* TODO(ui): favorites grid, remove-from-favorites */}
      {favorites.length === 0 ? <p>{t("listings.noListings")}</p> : <p>{favorites.length} favorites</p>}
    </main>
  );
}