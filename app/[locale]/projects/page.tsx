import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildLocalizedAlternates,
  buildSocialMetadata,
  type PublicLocale,
} from "@/lib/seo";
import { ProjectShowcase } from "@/components/project-showcase";
import noPhoto from "@/app/assets/no-photo.webp";
import { getProjectsData } from "@/lib/data/content";

type Props = { params: Promise<{ locale: string }> };

type Locale = "tr" | "en";

// projeler sayfasının dil bazlı metasını hazırlıyorum
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: PublicLocale = locale === "en" ? "en" : "tr";
  const t = await getTranslations({ locale: activeLocale, namespace: "Metadata.projects" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: buildLocalizedAlternates(activeLocale, "/projects"),
    ...buildSocialMetadata({ locale: activeLocale, path: "/projects", title, description }),
  };
}

// yayınlanan projeleri liste componentine gönderiyorum
export default async function Page({ params }: Props) {
  const { locale } = await params;
  const activeLocale: PublicLocale = locale === "en" ? "en" : "tr";
  const t = await getTranslations({ locale: activeLocale, namespace: "Pages.projects" });
  const b = await getTranslations({ locale: activeLocale, namespace: "Breadcrumb" });
  // sadece yayınlananları gösteriyorum
  const projects = await getProjects(locale);


  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(activeLocale, [
          { name: b("home"), href: "/" },
          { name: t("title") },
        ])}
      />
      <PageHeader
        title={t("title")}
        description={t("description")}
        crumbs={[
          { label: b("home"), href: "/" },
          { label: t("title") },
        ]}
      />




      <div className="min-h-[20vh]">
        <ProjectShowcase
          projects={projects}
          fallbackImage={noPhoto.src}
          heading={t("allProjects")}
          emptyMessage={t("emptyProjects")}
        />
      </div>
    </>
  );
}

async function getProjects(locale: string) {
  const { data: projects, error } = await getProjectsData();
  if (error) return [];
  const activeLocale: Locale = locale === "en" ? "en" : "tr";

  return projects
    .filter((project) => project.is_published)
    .flatMap((project) => {
      const translation = project.project_translations.find(
        (item) => item.locale === activeLocale,
      );

      if (!translation) return [];

      // kapak yoksa ilk fotoğrafı alıyorum
      const image =
        project.main_photo ??
        [...(project.project_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ??
        noPhoto.src;

      return [{
        title: translation.title,
        description: translation.description ?? "",
        metric: formatWeight(project.weight_tons, activeLocale),
        link: `/${locale}/projects#${project.slug}`,
        image,
      }];
    });
}

function formatWeight(value: number | null, locale: Locale) {
  if (value === null) return "-";

  return `${new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value)} ton`;
}
