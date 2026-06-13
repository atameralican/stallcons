import { MetadataRoute } from 'next';

const BASE_URL = 'https://stallcons.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/*/admin',
        '/api',
        '/*/api',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
