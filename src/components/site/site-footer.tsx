import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FOOTER_QUICK_LINKS, SITE_CONFIG } from "@/lib/constants";

/**
 * Site footer: brand, quick links and copyright.
 * Listing-owner phone/WhatsApp is intentionally not rendered here — it is
 * revealed only through the rate-limited contact action, per listing.
 */
export async function SiteFooter({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <footer className="section-bento section-bento-dark border-t border-gold/30 bg-charcoal text-sand">
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-8 sm:px-6 md:pt-20 lg:px-8">
        <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-sm font-semibold tracking-wide text-gold">
              {SITE_CONFIG.name}
            </h2>
            <p className="mt-3 text-sm text-sand/70">{t("footer.tagline")}</p>
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-sm font-semibold tracking-wide text-gold">
              {t("footer.quickLinks")}
            </h2>
            <ul className="mt-5 space-y-2">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-sand/85 hover:text-sand motion-reduce:transition-none"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 border-t border-sand/10 pt-6 text-center md:text-start">
          <p className="text-xs text-sand/50">
            {t("footer.copyright", { brand: SITE_CONFIG.name })}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;