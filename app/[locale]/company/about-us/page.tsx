import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildLocalizedAlternates,
  buildSocialMetadata,
  type PublicLocale,
} from "@/lib/seo";
import { AboutContent } from "./about-content";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: PublicLocale = locale === "en" ? "en" : "tr";
  const t = await getTranslations({ locale: activeLocale, namespace: "Metadata.aboutUs" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: buildLocalizedAlternates(activeLocale, "/company/about-us"),
    ...buildSocialMetadata({ locale: activeLocale, path: "/company/about-us", title, description }),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const activeLocale: PublicLocale = locale === "en" ? "en" : "tr";
  const t = await getTranslations({ locale: activeLocale, namespace: "Pages.aboutUs" });
  const b = await getTranslations({ locale: activeLocale, namespace: "Breadcrumb" });

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(activeLocale, [
          { name: b("home"), href: "/" },
          { name: b("corporate"), href: "/company/about-us" },
          { name: t("title") },
        ])}
      />
      <PageHeader
        title={t("title")}
        description={t("description")}
        crumbs={[
          { label: b("home"), href: "/" },
          { label: b("corporate"), href: "/company/about-us" },
          { label: t("title") },
        ]}
      />
      <AboutContent />
    </>
  );
}
