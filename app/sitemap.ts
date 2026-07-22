import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://stallcons.com';
const locales = ['tr', 'en'];

const staticPaths = [
  '',
  '/company/about-us',
  '/company/mission-vision',
  '/company/quality',
  '/projects',
  '/contact',
];

type SitemapActivityArea = {
  activity_area_translations: Array<{
    locale: string;
    slug: string;
  }>;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of locales) {
      sitemapEntries.push(createSitemapEntry(locale, path));
    }
  }

  return [...sitemapEntries, ...(await getActivityAreaSitemapEntries())];
}

function createSitemapEntry(
  locale: string,
  path: string,
  alternates: Record<string, string> = {
    tr: `${BASE_URL}/tr${path}`,
    en: `${BASE_URL}/en${path}`,
  }
) {
  return {
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1.0 : 0.8,
    alternates: {
      languages: alternates,
    },
  } satisfies MetadataRoute.Sitemap[number];
}

async function getActivityAreaSitemapEntries() {
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
    .from('activity_areas')
    .select(`
      activity_area_translations (
        locale,
        slug
      )
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];

  const entries: MetadataRoute.Sitemap = [];

  for (const activityArea of data as SitemapActivityArea[]) {
    const translations = activityArea.activity_area_translations ?? [];
    const trSlug = translations.find((translation) => translation.locale === 'tr')?.slug;
    const enSlug = translations.find((translation) => translation.locale === 'en')?.slug;
    const alternatePaths = {
      tr: trSlug ? `${BASE_URL}/tr/expertise-areas/${trSlug}` : undefined,
      en: enSlug ? `${BASE_URL}/en/expertise-areas/${enSlug}` : undefined,
    };
    const languages = Object.fromEntries(
      Object.entries(alternatePaths).filter((entry): entry is [string, string] => Boolean(entry[1]))
    );

    if (trSlug) {
      entries.push(createSitemapEntry('tr', `/expertise-areas/${trSlug}`, languages));
    }

    if (enSlug) {
      entries.push(createSitemapEntry('en', `/expertise-areas/${enSlug}`, languages));
    }
  }

  return entries;
}
