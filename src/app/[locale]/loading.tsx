"use client";

import { useTranslations } from "next-intl";

/**
 * Loading placeholder skeleton. Real skeleton UI is the UI owner's
 * responsibility; this shell shows locale-aware copy.
 */
export default function LoadingPage() {
  const t = useTranslations();
  return <main aria-busy="true">{t("common.loading")}</main>;
}