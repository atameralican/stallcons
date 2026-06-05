import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import ExpertiseImageBentoGallery from "@/components/bento-gallery";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.qualityControl" });
  const b = await getTranslations({ locale, namespace: "Breadcrumb" });
  return {
    title: t("title"),
    description: t("description"),
    other: {
      "application/ld+json": buildBreadcrumbJsonLd([
        { name: b("home"), href: "/" },
        { name: b("expertiseAreas"), href: "/expertise-areas/steel-construction" },
        { name: t("title") },
      ]),
    },
  };
}

// Sample data for the image gallery
const imageItems = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    span: "md:row-span-1",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    span: "md:row-span-1",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&q=80",
    span: "md:row-span-2",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1506606401543-2e73709cebb4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Q2l0eSUyMGF0JTIwTmlnaHR8ZW58MHx8MHx8fDA%3D?w=800&q=80",
    span: "md:row-span-1",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1634023233766-0c16b151bfb0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TWlzdHklMjBMYWtlfGVufDB8fDB8fHww?w=800&q=80",
    span: "md:col-span-2 md:row-span-1",
  },
]

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.qualityControl" });
  const b = await getTranslations({ locale, namespace: "Breadcrumb" });

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        crumbs={[
          { label: b("home"), href: "/" },
          { label: b("expertiseAreas"), href: "/expertise-areas/steel-construction" },
          { label: t("title") },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16" />
      <div className="w-full antialiased">
        <ExpertiseImageBentoGallery
          imageItems={imageItems}
          description="A collection of stunning landscapes. Drag to explore, click to expand."
        />
      </div>
    </>
  );
}
