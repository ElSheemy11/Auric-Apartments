import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return {
    title: t("home.title"),
    description: t("home.subtitle"),
    alternates: { languages: { en: "/en", ar: "/ar" } },
  };
}

/**
 * Home page placeholder. Real sections (hero, featured listings, …) are the
 * UI owner's responsibility; this shell renders real data once Step 2 wires
 * the listings queries.
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main>
      <h1>{t("home.title")}</h1>
      <p>{t("home.subtitle")}</p>
      <Link href="/listings">{t("home.cta")}</Link>
      {/* TODO(ui): design home page sections. No data yet — wired in Step 2. */}
    </main>
  );
}
