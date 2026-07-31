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
import { PrivacyPolicyContent } from "./privacy-policy-content";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: PublicLocale = locale === "en" ? "en" : "tr";
  const t = await getTranslations({ locale: activeLocale, namespace: "Metadata.privacyPolicy" });
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: buildLocalizedAlternates(activeLocale, "/privacy-policy"),
    ...buildSocialMetadata({ locale: activeLocale, path: "/privacy-policy", title, description }),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const activeLocale: PublicLocale = locale === "en" ? "en" : "tr";
  const t = await getTranslations({ locale: activeLocale, namespace: "Pages.privacyPolicy" });
  const b = await getTranslations({ locale: activeLocale, namespace: "Breadcrumb" });

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(activeLocale, [
          { name: b("home"), href: "/" },
          { name: b("privacyPolicy") },
        ])}
      />
      <PageHeader
        title={t("title")}
        description={t("description")}
        crumbs={[
          { label: b("home"), href: "/" },
          { label: b("privacyPolicy") },
        ]}
      />
      <PrivacyPolicyContent locale={locale} />
    </>
  );
}
