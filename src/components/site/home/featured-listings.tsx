import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ListingCard } from "@/components/listings/listing-card";
import { getFeaturedListings } from "@/server/queries/listings";

export function FeaturedSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none"
          />
        ))}
      </div>
    </section>
  );
}

export async function FeaturedListings() {
  const t = await getTranslations("home.featured");
  const items = await getFeaturedListings(6);

  return (
    <section id="featured" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          href="/listings"
          className="shrink-0 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("viewAll")}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}