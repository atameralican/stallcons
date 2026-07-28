import { getTranslations } from "next-intl/server";
import GalleryShowcase from "@/components/gallery-showcase";
import HoverBrandLogo from "@/components/hover-brand-logo";
import { Timeline, type TimelineHizmetData } from "@/components/timeline";
import noPhoto from "@/app/assets/no-photo.webp";
import { HomeHero } from "@/components/home-hero";
import {
  getActivityAreasData,
  getHizmetlerData,
  getPartnersData,
} from "@/lib/data/content";

type Locale = "tr" | "en";

type HizmetTranslation = {
  id: string;
  locale: Locale | "es";
  title: string;
  description: string | null;
};

type HizmetPhoto = {
  id: string;
  url: string;
  created_at: string;
};

type HizmetRecord = {
  id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  hizmet_translations: HizmetTranslation[];
  hizmet_photos: HizmetPhoto[];
};

type ActivityAreaTranslation = {
  id: string;
  locale: Locale | "es";
  title: string;
  subtitle: string | null;
  description: string | null;
  slug: string;
};

type ActivityAreaRecord = {
  id: string;
  main_photo: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  activity_area_translations: ActivityAreaTranslation[];
};

type HomeActivityArea = {
  id: string;
  name: string;
  role: string;
  href: string;
  image: string;
};

type Props = {
  params: Promise<{ locale: string }>;
};

// ana sayfa verilerini paralel alıp bölümlere dağıtıyorum
export default async function Home({ params }: Props) {
  const { locale } = await params;
  const activeLocale: Locale = locale === "en" ? "en" : "tr";
  const t = await getTranslations({ locale: activeLocale, namespace: "Pages.home" });
  const [activityAreas, hizmetler, partners] = await Promise.all([
    getHomeActivityAreas(activeLocale),
    getHomeHizmetler(activeLocale),
    getHomePartners(),
  ]);

  return (
    <>
      <HomeHero locale={activeLocale} />

      {activityAreas.length > 0 && (
        <div className="min-h-[40vh] mt-5 w-full text-black dark:text-white ">
          <div className="max-w-7xl mx-auto pt-10 pb-4 px-4 md:px-8 lg:px-10">
            <h2 className="text-lg md:text-4xl mb-4 max-w-4xl">
              {t("activitiesTitle")}
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-xl">
              {t("activitiesDescription")}
            </p>
          </div>
          <GalleryShowcase datas={activityAreas} />
        </div>
      )}

      <div className="min-h-[40vh] mt-5 w-full bg-white dark:bg-neutral-950 text-black dark:text-white">
        <div className="max-w-7xl mx-auto pt-20 pb-4 px-4 md:px-8 lg:px-10">
          <h2 className="text-lg md:text-4xl mb-4  max-w-4xl">
            {t("servicesTitle")}
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-xl">
            {t("servicesDescription")}
          </p>
        </div>
        <Timeline
          hizmetler={hizmetler}
          fallbackImage={noPhoto.src}
          locale={activeLocale}
        />
      </div>

      <div className="min-h-[20vh] mt-5 ">
        <HoverBrandLogo
          partners={partners}
          eyebrow={t("partnersEyebrow")}
          title={t("partnersTitle")}
        />
      </div>
    </>
  );
}

// aktif faaliyet alanlarını galeriye hazırlıyorum
async function getHomeActivityAreas(locale: Locale): Promise<HomeActivityArea[]> {
  const { data, error } = await getActivityAreasData();
  if (error) return [];

  return data
    .filter((activityArea) => activityArea.is_active)
    .map((activityArea) => mapActivityAreaForGallery(activityArea, locale))
    .filter((activityArea): activityArea is HomeActivityArea => Boolean(activityArea));
}

function mapActivityAreaForGallery(activityArea: ActivityAreaRecord, locale: Locale) {
  const currentTranslation = activityArea.activity_area_translations.find((item) => item.locale === locale);
  const fallbackTranslation = activityArea.activity_area_translations.find((item) => item.locale === "tr")
    ?? activityArea.activity_area_translations.find((item) => item.locale === "en");
  const translation = currentTranslation ?? fallbackTranslation;

  if (!translation?.title || !translation.slug) return null;

  if (!activityArea.main_photo) return null;

  return {
    id: activityArea.id,
    name: translation.title,
    role: translation.subtitle ?? translation.description ?? "",
    href: `/expertise-areas/${translation.slug}`,
    image: activityArea.main_photo,
  };
}

// yayınlanan hizmetleri timeline için alıyorum
async function getHomeHizmetler(locale: Locale) {
  const { data, error } = await getHizmetlerData();
  if (error) return [];

  return data
    .filter((hizmet) => hizmet.is_published)
    .map((hizmet) => mapHizmetForTimeline(hizmet, locale))
    .filter((hizmet): hizmet is TimelineHizmetData => Boolean(hizmet));
}

function mapHizmetForTimeline(hizmet: HizmetRecord, locale: Locale) {
  const currentTranslation = hizmet.hizmet_translations.find((item) => item.locale === locale);
  const fallbackTranslation = hizmet.hizmet_translations.find((item) => item.locale === "tr")
    ?? hizmet.hizmet_translations.find((item) => item.locale === "en");
  const translation = currentTranslation ?? fallbackTranslation;

  if (!translation?.title) return null;

  return {
    id: hizmet.id,
    title: translation.title,
    description: translation.description ?? "",
    photos: hizmet.hizmet_photos.map((photo) => photo.url).filter(Boolean),
  };
}

// yayınlanan partnerleri alıyorum
async function getHomePartners() {
  const { data, error } = await getPartnersData();
  return error ? [] : data.filter((partner) => partner.is_published);
}
