import { headers } from "next/headers";
import GalleryShowcase from "@/components/gallery-showcase";
import HoverBrandLogo from "@/components/hover-brand-logo";
import { Timeline, type TimelineHizmetData } from "@/components/timeline";
import noPhoto from "@/app/assets/no-photo.webp";
import { HomeHero } from "@/components/home-hero";

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

type HizmetlerResponse = {
  hizmetler?: HizmetRecord[];
  error?: string;
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const activeLocale: Locale = locale === "en" ? "en" : "tr";
  const [hizmetler, partners] = await Promise.all([
    getHomeHizmetler(activeLocale),
    getHomePartners(),
  ]);

  return (
    <>
      <HomeHero locale={activeLocale} />

      <div className="min-h-[40vh] mt-5- w-full text-black dark:text-white ">
        <div className="max-w-7xl mx-auto pt-10 pb-4 px-4 md:px-8 lg:px-10">
          <h2 className="text-lg md:text-4xl mb-4 max-w-4xl">
            {activeLocale === "tr" ? "Faaliyetler" : "Activities"}
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-xl">
            {activeLocale === "tr"
              ? "Kapsamlı deneyimimizle endüstriyel tesisler, inşaat projeleri, otomasyon sistemleri ve enerji çözümlerinde güvenilir partneriniziz. Yıllara dayanan uzmanlığımızla projelerinizi baştan sona yönetiyoruz."
              : "With our broad experience, we are your reliable partner in industrial facilities, construction projects, automation systems and energy solutions. We manage your projects from start to finish with years of expertise."}
          </p>
        </div>
        <GalleryShowcase />
      </div>

      <div className="min-h-[40vh] mt-5- w-full bg-white dark:bg-neutral-950 text-black dark:text-white">
        <div className="max-w-7xl mx-auto pt-20 pb-4 px-4 md:px-8 lg:px-10">
          <h2 className="text-lg md:text-4xl mb-4  max-w-4xl">
            Hizmet Alanlarımız
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-xl">
            {activeLocale === "tr"
              ? "Çelik konstrüksiyon, mühendislik, imalat ve montaj süreçlerinde ihtiyaca göre şekillenen profesyonel hizmetler sunuyoruz."
              : "We provide professional services shaped around your needs across steel construction, engineering, fabrication and assembly processes."}
          </p>
        </div>
        <Timeline hizmetler={hizmetler} fallbackImage={noPhoto.src} />
      </div>

      <div className="min-h-[20vh] mt-5 ">
        <HoverBrandLogo partners={partners} />
      </div>
    </>
  );
}

async function getHomeHizmetler(locale: Locale) {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) return [];

  try {
    // hizmet alanları server tarafında admin services routeundan geliyor
    const response = await fetch(`${protocol}://${host}/api/admin/hizmetler`, {
      cache: "no-store",
    });

    if (!response.ok) return [];

    const result = (await response.json()) as HizmetlerResponse;

    return (result.hizmetler ?? [])
      .filter((hizmet) => hizmet.is_published)
      .map((hizmet) => mapHizmetForTimeline(hizmet, locale))
      .filter((hizmet): hizmet is TimelineHizmetData => Boolean(hizmet));
  } catch {
    // hata olursa sayfa patlamasın boş kalsın
    return [];
  }
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

async function getHomePartners() {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) return [];

  try {
    const response = await fetch(`${protocol}://${host}/api/admin/partners`, {
      cache: "no-store",
    });

    if (!response.ok) return [];

    const result = await response.json();
    return (result.partners ?? []).filter((partner: any) => partner.is_published);
  } catch {
    return [];
  }
}
