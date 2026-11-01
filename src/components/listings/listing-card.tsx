import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  BadgeCheckIcon,
  BathIcon,
  BedDoubleIcon,
  MapPinIcon,
  RulerIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { ListingView } from "@/types/listing";

export function ListingCard({ listing }: { listing: ListingView }) {
  const t = useTranslations("card");
  const tTypes = useTranslations("propertyTypes");
  const tGender = useTranslations("gender");
  const locale = useLocale();

  const price = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(listing.price);

  const period =
    listing.billingPeriod === "monthly"
      ? t("perMonth")
      : listing.billingPeriod === "yearly"
        ? t("perYear")
        : null;

  const src = listing.coverImage ?? "/placeholder.svg";
  const km = listing.distanceToUniversityKm
    ? Number(listing.distanceToUniversityKm)
    : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link
        href={`/listings/${listing.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={src}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            unoptimized={src.endsWith(".svg")}
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {listing.isVerified && (
            <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm">
              <BadgeCheckIcon aria-hidden className="size-3.5" />
              {t("verified")}
            </span>
          )}
          {listing.listingType === "sale" && (
            <span className="absolute end-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
              {t("forSale")}
            </span>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-1 text-base font-semibold text-foreground">
              {listing.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon aria-hidden className="size-3.5 shrink-0" />
              <span className="line-clamp-1">{listing.neighborhood}</span>
            </p>
          </div>

          <p className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-foreground">{price}</span>
            {period && (
              <span className="text-sm text-muted-foreground">{period}</span>
            )}
          </p>

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <BedDoubleIcon aria-hidden className="size-4" />
              <span className="sr-only">{t("bedrooms")}</span>
              {listing.bedrooms}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <BathIcon aria-hidden className="size-4" />
              <span className="sr-only">{t("bathrooms")}</span>
              {listing.bathrooms}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <RulerIcon aria-hidden className="size-4" />
              <span className="sr-only">{t("area")}</span>
              {t("areaValue", { count: listing.areaM2 })}
            </li>
          </ul>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
              {tTypes(listing.propertyType)}
            </span>
            {listing.furnished && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                {t("furnished")}
              </span>
            )}
            {listing.genderPreference !== "any" && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">
                {tGender(listing.genderPreference)}
              </span>
            )}
            {km !== null && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                {t("distance", { km })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}