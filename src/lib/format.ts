const intlLocale = (locale: string) => (locale === "ar" ? "ar-EG" : "en-GB");

export function formatNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(n);
}

export function formatPriceEGP(cents: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(iso: string, locale: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "2 hours ago" / "منذ ساعتين". */
export function formatRelativeTime(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar-EG" : "en", {
    numeric: "auto",
  });
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), "hour");
  return rtf.format(Math.round(seconds / 86_400), "day");
}

export function formatAreaM2(sqm: number, locale: string): string {
  return `${formatNumber(sqm, locale)} m²`;
}