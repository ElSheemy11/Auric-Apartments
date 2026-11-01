import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params?: Promise<{ locale: string }>;
};

export default async function NotFoundPage({ params }: Props) {
  const locale = params ? (await params).locale : "ar";
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main>
      <h1>{t("errors.notFound")}</h1>
      <p>{t("common.error")}</p>
      <Link href="/">{t("nav.home")}</Link>
    </main>
  );
}