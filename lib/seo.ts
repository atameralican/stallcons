export type BreadcrumbSchemaItem = {
  name: string;
  href?: string;
};

export type PublicLocale = "tr" | "en";

export const BASE_URL = "https://www.stallcons.com";
export const ORGANIZATION_ID = `${BASE_URL}/#organization`;

type LocalizedPaths = Partial<Record<PublicLocale, string>>;

function normalizePath(path: string) {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildLocalizedAlternates(
  locale: PublicLocale,
  path: string,
  localizedPaths?: LocalizedPaths,
) {
  const trPath = normalizePath(localizedPaths?.tr ?? path);
  const enPath = normalizePath(localizedPaths?.en ?? path);

  return {
    canonical: `/${locale}${locale === "tr" ? trPath : enPath}`,
    languages: {
      tr: `/tr${trPath}`,
      en: `/en${enPath}`,
      "x-default": `/tr${trPath}`,
    },
  };
}

export function buildBreadcrumbJsonLd(
  locale: PublicLocale,
  crumbs: BreadcrumbSchemaItem[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href
        ? { item: `${BASE_URL}/${locale}${normalizePath(c.href)}` }
        : {}),
    })),
  };
}

type SocialMetadataInput = {
  locale: PublicLocale;
  path: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

export function buildSocialMetadata({
  locale,
  path,
  title,
  description,
  image,
  imageAlt,
}: SocialMetadataInput) {
  const normalizedPath = normalizePath(path);
  const url = `${BASE_URL}/${locale}${normalizedPath}`;
  const socialTitle = title.includes("Stallcons")
    ? title
    : `${title} | Stallcons`;
  const socialImage = image ?? `${BASE_URL}/${locale}/opengraph-image`;
  const socialImageAlt = imageAlt ?? (
    locale === "tr"
      ? "Stallcons çelik konstrüksiyon ve mühendislik çözümleri"
      : "Stallcons structural steel construction and engineering solutions"
  );

  return {
    openGraph: {
      type: "website" as const,
      siteName: "Stallcons",
      title: socialTitle,
      description,
      url,
      locale: locale === "tr" ? "tr_TR" : "en_US",
      alternateLocale: locale === "tr" ? ["en_US"] : ["tr_TR"],
      images: [{
        url: socialImage,
        width: 1200,
        height: 630,
        alt: socialImageAlt,
      }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: socialTitle,
      description,
      images: [{
        url: socialImage,
        alt: socialImageAlt,
      }],
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Stallcons Steel Construction",
    alternateName: "Stallcons",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/brand/stallcons-organization-logo-512.png`,
      width: 512,
      height: 512,
    },
    email: "info@stallcons.com",
    telephone: "+90 546 546 82 92",
    sameAs: ["https://www.linkedin.com/company/stallcons"],
  };
}

type ServiceJsonLdInput = {
  locale: PublicLocale;
  path: string;
  name: string;
  description: string;
};

export function buildServiceJsonLd({
  locale,
  path,
  name,
  description,
}: ServiceJsonLdInput) {
  const url = `${BASE_URL}/${locale}${normalizePath(path)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    url,
    inLanguage: locale,
    provider: {
      "@id": ORGANIZATION_ID,
    },
    areaServed: [
      { "@type": "Country", name: "Türkiye" },
      { "@type": "Country", name: "United States" },
      { "@type": "Continent", name: "Europe" },
      { "@type": "Continent", name: "Africa" },
    ],
  };
}
