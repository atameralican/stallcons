import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import ExpertiseImageBentoGallery from "@/components/bento-gallery";
import { PageHeader } from "@/components/page-header";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

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
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  activity_area_translations: ActivityAreaTranslation[];
  activity_area_photos: ActivityAreaPhoto[];
};

type ActivityAreasResponse = {
  activityAreas?: ActivityAreaRecord[];
  error?: string;
};

type ActivityAreaPageData = {
  title: string;
  subtitle: string;
  description: string;
  imageItems: Array<{
    id: string;
    url: string;
    title: string | null;
    desc: string | null;
    span: string;
  }>;
};

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const PHOTO_SPANS = [
  "md:col-span-2 md:row-span-2",
  "md:row-span-1",
  "md:row-span-1",
  "md:row-span-2",
  "md:row-span-1",
  "md:col-span-2 md:row-span-1",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const activeLocale: Locale = locale === "en" ? "en" : "tr";
  const activityArea = await getActivityAreaBySlug(activeLocale, slug);

  if (!activityArea) {
    return {
      title: "Faaliyet Alanı",
    };
  }

  const b = await getTranslations({ locale: activeLocale, namespace: "Breadcrumb" });

  return {
    title: activityArea.title,
    description: activityArea.subtitle,
    other: {
      "application/ld+json": buildBreadcrumbJsonLd([
        { name: b("home"), href: "/" },
        { name: b("expertiseAreas") },
        { name: activityArea.title },
      ]),
    },
  };
}

export default async function ActivityAreaDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const activeLocale: Locale = locale === "en" ? "en" : "tr";
  const activityArea = await getActivityAreaBySlug(activeLocale, slug);

  if (!activityArea) {
    notFound();
  }

  const b = await getTranslations({ locale: activeLocale, namespace: "Breadcrumb" });

  return (
    <>
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
    </>
  );
}

async function getActivityAreaBySlug(locale: Locale, slug: string) {
  const activityAreas = await getActivityAreas();
  const matchedArea = activityAreas.find((activityArea) =>
    activityArea.activity_area_translations.some((translation) =>
      translation.slug === slug && (translation.locale === locale || translation.locale === "tr" || translation.locale === "en")
    )
  );

  if (!matchedArea?.is_active) return null;

  return mapActivityAreaForPage(matchedArea, locale, slug);
}

async function getActivityAreas() {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) return [] as ActivityAreaRecord[];

  try {
    const response = await fetch(`${protocol}://${host}/api/admin/activity-areas`, {
      cache: "no-store",
    });

    if (!response.ok) return [];

    const result = (await response.json()) as ActivityAreasResponse;

    return result.activityAreas ?? [];
  } catch {
    return [];
  }
}

function mapActivityAreaForPage(activityArea: ActivityAreaRecord, locale: Locale, slug: string): ActivityAreaPageData | null {
  const matchedTranslation = activityArea.activity_area_translations.find((item) => item.slug === slug);
  const currentTranslation = activityArea.activity_area_translations.find((item) => item.locale === locale);
  const fallbackTranslation = activityArea.activity_area_translations.find((item) => item.locale === "tr")
    ?? activityArea.activity_area_translations.find((item) => item.locale === "en");
  const translation = currentTranslation ?? matchedTranslation ?? fallbackTranslation;

  if (!translation?.title || !translation.slug) return null;

  const sortedPhotos = [...(activityArea.activity_area_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order);
  const imageItems = sortedPhotos.map((photo, index) => ({
    id: photo.id,
    url: photo.photo_url,
    title: translation.title,
    desc: translation.subtitle,
    span: PHOTO_SPANS[index % PHOTO_SPANS.length],
  }));

  return {
    title: translation.title,
    subtitle: translation.subtitle ?? "",
    description: translation.description ?? "",
    imageItems,
  };
}
