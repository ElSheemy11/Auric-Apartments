import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function OwnerCta() {
  const t = useTranslations("home.owners");

  return (
    <section id="owners" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 pt-8">
      <div className="section-bento rounded-3xl border border-border bg-card/60 px-6 py-14 text-center">
        <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("body")}</p>
        <Link
          href="/dashboard/listings/new"
          className="btn-shine mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}