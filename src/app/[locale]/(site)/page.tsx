import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  FeaturedListings,
  FeaturedSkeleton,
} from "@/components/site/home/featured-listings";
import { Hero, HeroSearchLoader } from "@/components/site/home/hero";
import { HowItWorks } from "@/components/site/home/how-it-works";
import { OwnerCta } from "@/components/site/home/owner-cta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { languages: { en: "/en", ar: "/ar" } },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Hero>
        <Suspense
          fallback={<div className="glass-surface mx-auto h-28 max-w-5xl rounded-2xl" />}
        >
          <HeroSearchLoader />
        </Suspense>
      </Hero>
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedListings />
      </Suspense>
      <HowItWorks />
      <OwnerCta />
    </main>
  );
}