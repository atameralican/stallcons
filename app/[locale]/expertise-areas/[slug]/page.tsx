import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ExpertiseImageBentoGallery from "@/components/bento-gallery";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildLocalizedAlternates,
  buildServiceJsonLd,
  buildSocialMetadata,
  type PublicLocale,
} from "@/lib/seo";
import { getActivitySeo } from "@/lib/activity-seo";
import { getVerifiedActivityDescription } from "@/lib/activity-content";
import { getActivityAreasData } from "@/lib/data/content";

type Locale = "tr" | "en";

type ActivityAreaTranslation = {
  id: string;
  locale: Locale | "es";
  title: string;
  subtitle: string | null;
  description: string | null;
  slug: string;
};

type ActivityAreaPhoto = {
  id: string;
  photo_url: string;
  sort_order: number;
  created_at: string;
};

type ActivityAreaRecord = {
  id: string;
  main_photo: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  activity_area_translations: ActivityAreaTranslation[];
  activity_area_photos: ActivityAreaPhoto[];
};

type ActivityAreaPageData = {
  title: string;
  subtitle: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  socialImage?: string;
  slug: string;
  localizedPaths: Partial<Record<Locale, string>>;
  imageItems: Array<{
    id: string;
    url: string;
    title: string | null;
    alt: string;
    desc: string | null;
    span: string;
  }>;
  relatedAreas: Array<{
    title: string;
    href: string;
  }>;
};

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const PHOTO_SPANS = [
  "md:row-span-2",
  "",
  "",
  "md:col-span-2",
  "",
  "",
];

// faaliyet alanının metasını kayıttan hazırlıyorum
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const activeLocale: PublicLocale = locale === "en" ? "en" : "tr";
  const activityArea = await getActivityAreaBySlug(activeLocale, slug);

  if (!activityArea) {
    return {
      title: "Faaliyet Alanı",
    };
  }

  return {
    title: activityArea.seoTitle,
    description: activityArea.seoDescription,
    alternates: buildLocalizedAlternates(
      activeLocale,
      `/expertise-areas/${activityArea.slug}`,
      activityArea.localizedPaths,
    ),
    ...buildSocialMetadata({
      locale: activeLocale,
      path: `/expertise-areas/${activityArea.slug}`,
      title: activityArea.seoTitle,
      description: activityArea.seoDescription,
      image: activityArea.socialImage,
      imageAlt: activeLocale === "tr"
        ? `${activityArea.title} faaliyet alanı görseli`
        : `${activityArea.title} service area image`,
    }),
  };
}

// slug ile bulunan faaliyet alanını galeride gösteriyorum
export default async function ActivityAreaDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const activeLocale: Locale = locale === "en" ? "en" : "tr";
  const activityArea = await getActivityAreaBySlug(activeLocale, slug);

  if (!activityArea) {
    notFound();
  }

  const b = await getTranslations({ locale: activeLocale, namespace: "Breadcrumb" });
  const t = await getTranslations({ locale: activeLocale, namespace: "Pages.activityDetail" });

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(activeLocale, [
          { name: b("home"), href: "/" },
          { name: b("expertiseAreas") },
          { name: activityArea.title },
        ])}
      />
      <JsonLd
        data={buildServiceJsonLd({
          locale: activeLocale,
          path: `/expertise-areas/${activityArea.slug}`,
          name: activityArea.title,
          description: activityArea.seoDescription,
        })}
      />
      <PageHeader
        title={activityArea.title}
        description={activityArea.subtitle}
        crumbs={[
          { label: b("home"), href: "/" },
          { label: b("expertiseAreas") },
          { label: activityArea.title },
        ]}
      />
      <div className="w-full antialiased">
        {activityArea.imageItems.length > 0 && (
          <ExpertiseImageBentoGallery
            imageItems={activityArea.imageItems}
            description={activityArea.description}
          />
        )}
      </div>
      <section className="mx-auto mt-12 max-w-5xl px-4 md:px-6">
        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t("nextStepTitle")}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            {t("nextStepDescription")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${activeLocale}/projects`}
              className="rounded-full bg-[#1E50A0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173f80]"
            >
              {t("projectsLink")}
            </Link>
            <Link
              href={`/${activeLocale}/contact`}
              className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              {t("contactLink")}
            </Link>
          </div>
          {activityArea.relatedAreas.length > 0 && (
            <nav className="mt-8 border-t border-black/10 pt-6 dark:border-white/10" aria-label={t("relatedLabel")}>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("relatedLabel")}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {activityArea.relatedAreas.map((area) => (
                  <Link key={area.href} href={`/${activeLocale}${area.href}`} className="font-medium text-[#1E50A0] underline-offset-4 hover:underline dark:text-blue-400">
                    {area.title}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

// slug ve dile göre doğru kaydı buluyorum
async function getActivityAreaBySlug(locale: Locale, slug: string) {
  const activityAreas = await getActivityAreas();
  const matchedArea = activityAreas.find((activityArea) =>
    activityArea.activity_area_translations.some((translation) =>
      translation.locale === locale && translation.slug === slug
    )
  );

  if (!matchedArea?.is_active) return null;

  return mapActivityAreaForPage(matchedArea, activityAreas, locale, slug);
}

async function getActivityAreas() {
  const { data, error } = await getActivityAreasData();
  return error ? [] as ActivityAreaRecord[] : data;
}

function mapActivityAreaForPage(activityArea: ActivityAreaRecord, activityAreas: ActivityAreaRecord[], locale: Locale, slug: string): ActivityAreaPageData | null {
  const translation = activityArea.activity_area_translations.find(
    (item) => item.locale === locale && item.slug === slug,
  );

  if (!translation?.title || !translation.slug) return null;

  const sortedPhotos = [...(activityArea.activity_area_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order);
  const imageItems = sortedPhotos.map((photo, index) => ({
    id: photo.id,
    url: photo.photo_url,
    title: locale === "tr"
      ? `${translation.title} galeri görseli ${index + 1}`
      : `${translation.title} gallery image ${index + 1}`,
    alt: "",
    desc: translation.subtitle,
    span: PHOTO_SPANS[index % PHOTO_SPANS.length],
  }));
  const seo = getActivitySeo(
    locale,
    translation.slug,
    translation.title,
    translation.subtitle ?? translation.description ?? "",
  );
  const verifiedDescription = getVerifiedActivityDescription(
    translation.slug,
    locale,
    translation.description ?? "",
  );

  return {
    title: translation.title,
    subtitle: translation.subtitle ?? "",
    description: verifiedDescription,
    seoTitle: seo.title,
    seoDescription: seo.description,
    socialImage: activityArea.main_photo ?? sortedPhotos[0]?.photo_url,
    relatedAreas: activityAreas
      .filter((item) => item.id !== activityArea.id && item.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((item) => {
        const relatedTranslation = item.activity_area_translations.find(
          (candidate) => candidate.locale === locale,
        );

        return relatedTranslation?.title && relatedTranslation.slug
          ? [{
              title: relatedTranslation.title,
              href: `/expertise-areas/${relatedTranslation.slug}`,
            }]
          : [];
      })
      .slice(0, 3),
    slug: translation.slug,
    localizedPaths: Object.fromEntries(
      activityArea.activity_area_translations
        .filter((item): item is ActivityAreaTranslation & { locale: Locale } =>
          item.locale === "tr" || item.locale === "en"
        )
        .map((item) => [
          item.locale,
          `/expertise-areas/${item.slug}`,
        ]),
    ),
    imageItems,
  };
}
