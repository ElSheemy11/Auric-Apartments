import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { listReports } from "@/server/queries/reports";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ locale: string }> };

/**
 * Admin page placeholder: reports, listings and users tabs. Admin actions are
 * the UI owner's responsibility; data from the real queries (stubbed in Step 1).
 */
export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  await requireAdmin();
  const reports = await listReports();

  return (
    <main>
      <h1>{t("admin.title")}</h1>
      {/* TODO(ui): tabs = reports, listings, users; review/dismiss reports,
          suspend/unsuspend users, verify/unpublish listings */}
      <p>{reports.length} reports</p>
    </main>
  );
}