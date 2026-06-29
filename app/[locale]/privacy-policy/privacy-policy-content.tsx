import { getTranslations } from "next-intl/server";

type Props = {
  locale: string;
};

const SECTION_KEYS = [
  "dataController",
  "personalDataProcessed",
  "purposes",
  "legalBasis",
  "transfer",
  "retention",
  "commercialMessages",
  "rights",
  "updates",
] as const;

export async function PrivacyPolicyContent({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "Pages.privacyPolicy" });

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <article className="rounded-xl border bg-card p-6 text-card-foreground shadow-none md:p-8">
          <div className="mb-8 border-b pb-6">
            <p className="text-sm font-medium text-muted-foreground">
              {t("lastUpdatedLabel")}
            </p>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              {t("lastUpdated")}
            </p>
          </div>

          <div className="space-y-8">
            {SECTION_KEYS.map((sectionKey) => {
              const paragraphs = t.raw(`sections.${sectionKey}.paragraphs`) as string[];
              const rawItems = t.raw(`sections.${sectionKey}.items`);
              const items = Array.isArray(rawItems) ? rawItems : [];

              return (
                <section key={sectionKey} className="space-y-3">
                  <h2 className="text-xl font-semibold">
                    {t(`sections.${sectionKey}.title`)}
                  </h2>

                  {paragraphs.map((paragraph, index) => (
                    <p
                      key={`${sectionKey}-paragraph-${index}`}
                      className="text-sm leading-7 text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {Array.isArray(items) && items.length > 0 && (
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
                      {items.map((item, index) => (
                        <li key={`${sectionKey}-item-${index}`}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
