import { MetadataRoute } from 'next';

const BASE_URL = 'https://stallcons.com';
const locales = ['tr', 'en'];

// Projedeki tüm aktif kamuya açık rotalar
const paths = [
  '',
  '/company/about-us',
  '/company/mission-vision',
  '/company/quality',
  '/expertise-areas/steel-construction',
  '/expertise-areas/engineering-design',
  '/expertise-areas/crane-systems',
  '/expertise-areas/defense',
  '/expertise-areas/consulting',
  '/expertise-areas/quality-control',
  '/products',
  '/projects',
  '/contact',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}${path}`;
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : 0.8,
        alternates: {
          languages: {
            tr: `${BASE_URL}/tr${path}`,
            en: `${BASE_URL}/en${path}`,
          },
        },
      });
    }
  }

  return sitemapEntries;
}
