import { useTranslations } from "next-intl";
import { ImagesIcon, MessageCircleIcon, SearchIcon } from "lucide-react";

const STEPS = [
  { icon: SearchIcon, title: "step1Title", body: "step1Body" },
  { icon: ImagesIcon, title: "step2Title", body: "step2Body" },
  { icon: MessageCircleIcon, title: "step3Title", body: "step3Body" },
] as const;

export function HowItWorks() {
  const t = useTranslations("home.how");

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <h2 className="text-center font-heading text-3xl text-foreground sm:text-4xl">
        {t("title")}
      </h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li
            key={title}
            className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-primary">
              <Icon aria-hidden className="size-6" />
            </span>
            <p className="mt-4 text-xs font-medium text-muted-foreground">
              {i + 1}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{t(title)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t(body)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}