import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { Phone, Mail, MapPin } from "lucide-react";
import { ContactForm } from "./contact-form";

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
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Sol — İletişim Bilgileri */}
            <div className="flex flex-col gap-8 pt-4 lg:col-span-1">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {t("sectionLabel")}
                </p>
                <h2 className="text-balance text-4xl font-bold leading-tight">
                  {t("sectionHeading")}
                </h2>
              </div>
              <p className="text-balance text-base leading-relaxed text-muted-foreground">
                {t("sectionDesc")}
              </p>
              <address className="not-italic flex flex-col gap-5">
                <a
                  href="tel:+905XXXXXXXXX"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background group-hover:border-foreground transition-colors">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                      {t("phone")}
                    </span>
                    +90 5XX XXX XX XX
                  </span>
                </a>
                <a
                  href="mailto:info@stallcons.com"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background group-hover:border-foreground transition-colors">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                      {t("email")}
                    </span>
                    info@stallcons.com
                  </span>
                </a>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                      {t("address")}
                    </span>
                    {t("addressValue")}
                  </span>
                </div>
                <a
                  href="https://www.linkedin.com/company/stallcons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background group-hover:border-foreground transition-colors">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                      {t("linkedin")}
                    </span>
                    linkedin.com/company/stallcons
                  </span>
                </a>
              </address>
            </div>

            {/* Sağ — İletişim Formu */}
            <ContactForm
              locale={locale}
              labels={{
                formHeading: t("formHeading"),
                firstname: t("firstname"),
                firstnamePlaceholder: t("firstnamePlaceholder"),
                lastname: t("lastname"),
                lastnamePlaceholder: t("lastnamePlaceholder"),
                emailLabel: t("emailLabel"),
                emailPlaceholder: t("emailPlaceholder"),
                phoneLabel: t("phoneLabel"),
                phonePlaceholder: t("phonePlaceholder"),
                subject: t("subject"),
                subjectPlaceholder: t("subjectPlaceholder"),
                message: t("message"),
                messagePlaceholder: t("messagePlaceholder"),
                send: t("send"),
                sending: t("sending"),
                privacyConsentPrefix: t("privacyConsentPrefix"),
                privacyConsentLink: t("privacyConsentLink"),
                privacyConsentSuffix: t("privacyConsentSuffix"),
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
