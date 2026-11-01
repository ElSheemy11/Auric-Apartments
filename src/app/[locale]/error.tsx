"use client";

import { useTranslations } from "next-intl";

type Props = {
  error: Error;
  reset?: () => void;
};

/**
 * Client error boundary (Next.js requires error.tsx to be a client component).
 * Shows locale-aware placeholder copy; real error handling is the UI owner's.
 */
export default function ErrorPage({ error, reset }: Props) {
  const t = useTranslations();

  return (
    <main>
      <h1>{t("errors.unknown")}</h1>
      {reset ? (
        <button type="button" onClick={reset}>
          {t("errors.validation")}
        </button>
      ) : null}
    </main>
  );
}