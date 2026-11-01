"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  "apartment",
  "room",
  "shared_room",
  "studio",
  "house",
] as const;

const fieldClass = cn(
  "h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm text-foreground",
  "transition-colors hover:border-primary/40",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

export function HeroSearch({ neighborhoods }: { neighborhoods: string[] }) {
  const t = useTranslations("home.search");
  const tTypes = useTranslations("propertyTypes");
  const router = useRouter();
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // Only send filled fields: empty values would fail validation
    // and drop the other filters.
    const params = new URLSearchParams({ listingType });
    const propertyType = String(data.get("propertyType") ?? "");
    const neighborhood = String(data.get("neighborhood") ?? "");
    const maxPrice = Math.floor(Number(data.get("maxPrice")));
    if (propertyType) params.set("propertyType", propertyType);
    if (neighborhood) params.set("neighborhood", neighborhood);
    if (Number.isFinite(maxPrice) && maxPrice > 0) {
      params.set("maxPrice", String(maxPrice));
    }
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-surface mx-auto grid w-full max-w-5xl gap-3 rounded-2xl p-3 text-start sm:grid-cols-2 sm:p-4 lg:grid-cols-[auto_1fr_1fr_1fr_auto] lg:items-end"
    >
      <div>
        <span className="mb-1.5 block text-xs text-muted-foreground">
          {t("listingType")}
        </span>
        <div
          role="radiogroup"
          aria-label={t("listingType")}
          className="flex h-11 rounded-xl border border-border bg-background/80 p-1"
        >
          {(["rent", "sale"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={listingType === value}
              onClick={() => setListingType(value)}
              className={cn(
                "rounded-lg px-4 text-sm transition-colors motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                listingType === value
                  ? "bg-primary font-medium text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(value)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="hs-type" className="mb-1.5 block text-xs text-muted-foreground">
          {t("propertyType")}
        </label>
        <select id="hs-type" name="propertyType" defaultValue="" className={fieldClass}>
          <option value="">{t("anyType")}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {tTypes(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="hs-area" className="mb-1.5 block text-xs text-muted-foreground">
          {t("neighborhood")}
        </label>
        <select id="hs-area" name="neighborhood" defaultValue="" className={fieldClass}>
          <option value="">{t("anyNeighborhood")}</option>
          {neighborhoods.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="hs-price" className="mb-1.5 block text-xs text-muted-foreground">
          {t("maxPrice")}
        </label>
        <input
          id="hs-price"
          name="maxPrice"
          type="number"
          min={0}
          step={100}
          inputMode="numeric"
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        className={cn(
          "btn-shine inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground",
          "shadow-md shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        )}
      >
        <SearchIcon aria-hidden className="size-4" />
        {t("submit")}
      </button>
    </form>
  );
}