/**
 * Sayfa bazlı BreadcrumbList JSON-LD oluşturur.
 * Next.js metadata.other üzerinden <head>'e inject edilir.
 * Kaynak: https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld
 */

export type BreadcrumbSchemaItem = {
  name: string;
  href?: string;
};

const BASE_URL = 'https://stallcons.com';

export function buildBreadcrumbJsonLd(crumbs: BreadcrumbSchemaItem[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${BASE_URL}${c.href}` } : {}),
    })),
  });
}
