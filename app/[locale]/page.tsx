import { headers } from "next/headers";
import GalleryShowcase from "@/components/gallery-showcase";
import HoverBrandLogo from "@/components/hover-brand-logo";
import { HomeHero } from "@/components/home-hero";
import { Timeline, type TimelineServiceData } from "@/components/timeline";
import noPhoto from "@/app/assets/no-photo.webp";

type Locale = "tr" | "en";

type ServiceTranslation = {
  id: string;
  locale: Locale | "es";
  title: string;
  description: string | null;
};

type ServicePhoto = {
  id: string;
  photo_url: string;
  created_at: string;
};

type ServiceRecord = {
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_translations: ServiceTranslation[];
  service_photos: ServicePhoto[];
};

type ServicesResponse = {
  services?: ServiceRecord[];
  error?: string;
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const activeLocale: Locale = locale === "en" ? "en" : "tr";
  const services = await getHomeServices(activeLocale);

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
        <Timeline services={services} fallbackImage={noPhoto.src} />
      </div>

      <div className="min-h-[20vh] mt-5 ">
        <HoverBrandLogo />
      </div>
    </>
  );
}

async function getHomeServices(locale: Locale) {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) return [];

  try {
    // hizmet alanları server tarafında admin services routeundan geliyor
    const response = await fetch(`${protocol}://${host}/api/admin/services`, {
      cache: "no-store",
    });

    if (!response.ok) return [];

    const result = (await response.json()) as ServicesResponse;

    return (result.services ?? [])
      .filter((service) => service.is_active)
      .map((service) => mapServiceForTimeline(service, locale))
      .filter((service): service is TimelineServiceData => Boolean(service));
  } catch {
    // hata olursa sayfa patlamasın boş kalsın
    return [];
  }
}

function mapServiceForTimeline(service: ServiceRecord, locale: Locale) {
  const currentTranslation = service.service_translations.find((item) => item.locale === locale);
  const fallbackTranslation = service.service_translations.find((item) => item.locale === "tr")
    ?? service.service_translations.find((item) => item.locale === "en");
  const translation = currentTranslation ?? fallbackTranslation;

  if (!translation?.title) return null;

  return {
    id: service.id,
    title: translation.title,
    description: translation.description ?? "",
    photos: service.service_photos.map((photo) => photo.photo_url).filter(Boolean),
  };
}
