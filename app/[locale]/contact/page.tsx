import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.contact" });
  const b = await getTranslations({ locale, namespace: "Breadcrumb" });
  return {
    title: t("title"),
    description: t("description"),
    other: {
      "application/ld+json": buildBreadcrumbJsonLd([
        { name: b("home"), href: "/" },
        { name: t("title") },
      ]),
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.contact" });
  const b = await getTranslations({ locale, namespace: "Breadcrumb" });

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        crumbs={[
          { label: b("home"), href: "/" },
          { label: t("title") },
        ]}
      />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest mb-4">
            {t("comingSoon")}
          </p>
          <h2 className="text-3xl font-bold mb-6">{t("workInProgress")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("workInProgressDesc")}
          </p>
        </div>
      </section>
    </>
  );
}
