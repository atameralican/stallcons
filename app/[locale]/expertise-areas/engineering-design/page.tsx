import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.engineeringDesign" });
  const b = await getTranslations({ locale, namespace: "Breadcrumb" });
  return {
    title: t("title"),
    description: t("description"),
    other: {
      "application/ld+json": buildBreadcrumbJsonLd([
        { name: b("home"), href: "/" },
        { name: b("expertiseAreas"), href: "/expertise-areas/steel-construction" },
        { name: t("title") },
      ]),
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.engineeringDesign" });
  const b = await getTranslations({ locale, namespace: "Breadcrumb" });

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        crumbs={[
          { label: b("home"), href: "/" },
          { label: b("expertiseAreas"), href: "/expertise-areas/steel-construction" },
          { label: t("title") },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16" />
    </>
  );
}
