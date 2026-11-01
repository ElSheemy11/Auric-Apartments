/**
 * Site identity and immutable defaults for Auric Apartments.
 * Single tenant, Aswan only. Prices are EGP; currency never comes from the client.
 */
export const SITE_CONFIG = {
  name: "Auric Apartments",
  defaultCity: "aswan",
  currency: "EGP",
} as const;

export const DEFAULT_CITY = "aswan";

/** Primary site navigation. Hrefs have no locale prefix: render with Link from @/i18n/navigation. */
export const CENTER_NAV_LINKS = [
  { key: "nav.home", href: "/" },
  { key: "nav.listings", href: "/listings" },
  { key: "nav.signIn", href: "/sign-in" },
] as const;

export const FOOTER_QUICK_LINKS = [
  { key: "nav.home", href: "/" },
  { key: "nav.listings", href: "/listings" },
] as const;