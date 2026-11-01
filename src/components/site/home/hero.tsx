import { useTranslations } from "next-intl";
import {
  BadgeCheckIcon,
  GraduationCapIcon,
  LanguagesIcon,
  MessageCircleIcon,
} from "lucide-react";

import { getNeighborhoods } from "@/server/queries/listings";
import { HeroSearch } from "./hero-search";

// Async so the page can wrap it in <Suspense> (needed with cacheComponents).
export async function HeroSearchLoader() {
  const neighborhoods = await getNeighborhoods();
  return <HeroSearch neighborhoods={neighborhoods} />;
}

export function Hero({ children }: { children: React.ReactNode }) {
  const t = useTranslations("home");

  const chips = [
    { icon: GraduationCapIcon, label: t("chips.campus") },
    { icon: MessageCircleIcon, label: t("chips.direct") },
    { icon: BadgeCheckIcon, label: t("chips.verified") },
    { icon: LanguagesIcon, label: t("chips.bilingual") },
  ];

  return (
    <section className="relative isolate px-4 pb-16 pt-32 sm:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 start-[-10%] h-[36rem] w-[36rem] rounded-full bg-aurora-gold/50 blur-3xl" />
        <div className="absolute end-[-10%] top-20 h-[32rem] w-[32rem] rounded-full bg-aurora-teal/40 blur-3xl" />
        <div className="absolute bottom-[-10rem] start-1/3 h-[28rem] w-[28rem] rounded-full bg-aurora-sand/60 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="mx-auto max-w-6xl text-center">
        <p className="animate-appear mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur motion-reduce:animate-none">
          <span className="size-1.5 rounded-full bg-primary" />
          {t("hero.badge")}
        </p>

        <h1 className="animate-appear mt-6 font-heading text-5xl leading-[1.1] tracking-tight text-foreground [animation-delay:100ms] motion-reduce:animate-none sm:text-6xl lg:text-7xl">
          {t("hero.titleLine1")}
          <br />
          <span className="text-primary">{t("hero.titleLine2")}</span>
        </h1>

        <p className="animate-appear mx-auto mt-6 max-w-2xl text-base text-muted-foreground [animation-delay:200ms] motion-reduce:animate-none sm:text-lg">
          {t("hero.subtitle")}
        </p>

        <div className="animate-appear mt-10 [animation-delay:300ms] motion-reduce:animate-none">
          {children}
        </div>

        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {chips.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Icon aria-hidden className="size-4 text-primary" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}