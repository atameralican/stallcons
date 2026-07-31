import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { BASE_URL, type PublicLocale } from "@/lib/seo";

export const dynamic = "force-dynamic";

const LOCALES: PublicLocale[] = ["tr", "en"];

const STATIC_PATHS = [
  "",
  "/company/about-us",
  "/company/mission-vision",
  "/company/quality",
  "/projects",
  "/contact",
  "/privacy-policy",
] as const;

type SitemapTranslation = {
  locale: string;
  slug: string;
};

type SitemapActivityArea = {
  id: string;
  updated_at: string | null;
  activity_area_translations: SitemapTranslation[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.flatMap((path) =>
    LOCALES.map((locale) => createStaticEntry(locale, path)),
  );

  return [...staticEntries, ...(await getActivityAreaEntries())];
}

function createStaticEntry(
  locale: PublicLocale,
  path: (typeof STATIC_PATHS)[number],
): MetadataRoute.Sitemap[number] {
  const languageUrls = createLanguageUrls(path, path);

  return {
    url: `${BASE_URL}/${locale}${path}`,
    alternates: {
      languages: languageUrls,
    },
  };
}

async function getActivityAreaEntries(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) return [];

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("activity_areas")
    .select(`
      id,
      updated_at,
      activity_area_translations (
        locale,
        slug
      )
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as SitemapActivityArea[]).flatMap(createActivityAreaEntries);
}

function createActivityAreaEntries(
  activityArea: SitemapActivityArea,
): MetadataRoute.Sitemap {
  const translations = activityArea.activity_area_translations ?? [];
  const trTranslation = getTranslation(translations, "tr");
  const enTranslation = getTranslation(translations, "en");

  if (!trTranslation && !enTranslation) return [];

  const languageUrls = createLanguageUrls(
    trTranslation ? `/expertise-areas/${trTranslation.slug}` : undefined,
    enTranslation ? `/expertise-areas/${enTranslation.slug}` : undefined,
  );

  return LOCALES.flatMap((locale) => {
    const translation = locale === "tr" ? trTranslation : enTranslation;
    if (!translation) return [];

    return [{
      url: `${BASE_URL}/${locale}/expertise-areas/${translation.slug}`,
      lastModified: getLastModified(activityArea.updated_at),
      alternates: {
        languages: languageUrls,
      },
    } satisfies MetadataRoute.Sitemap[number]];
  });
}

function getTranslation(
  translations: SitemapTranslation[],
  locale: PublicLocale,
) {
  return translations.find(
    (translation) => translation.locale === locale && translation.slug.trim(),
  );
}

function createLanguageUrls(trPath?: string, enPath?: string) {
  const languages: Record<string, string> = {};

  if (trPath !== undefined) languages.tr = `${BASE_URL}/tr${trPath}`;
  if (enPath !== undefined) languages.en = `${BASE_URL}/en${enPath}`;

  const defaultUrl = languages.tr ?? languages.en;
  if (defaultUrl) languages["x-default"] = defaultUrl;

  return languages;
}

function getLastModified(updatedAt: string | null) {
  if (!updatedAt) return undefined;

  const lastModified = new Date(updatedAt);
  return Number.isNaN(lastModified.getTime()) ? undefined : lastModified;
}
