import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { ProjectShowcase } from "@/components/project-showcase";
import noPhoto from "@/app/assets/no-photo.webp";

type Props = { params: Promise<{ locale: string }> };

type Locale = "tr" | "en";

type ProjectTranslation = {
  locale: Locale;
  title: string;
  description: string | null;
};

type ProjectPhoto = {
  url: string;
  sort_order: number;
};

type ProjectRecord = {
  slug: string;
  main_photo: string | null;
  weight_tons: number | null;
  is_published: boolean;
  project_translations: ProjectTranslation[];
  project_photos: ProjectPhoto[];
};

type ProjectsResponse = {
  projects?: ProjectRecord[];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.projects" });
  const b = await getTranslations({ locale, namespace: "Breadcrumb" });
  return {
    title: t("title"),
    description: t("description"),
    other: {
      "application/ld+json": buildBreadcrumbJsonLd([
        { name: b("home"), href: "/" },
        { name: t("title") },
      ]),
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.projects" });
  const b = await getTranslations({ locale, namespace: "Breadcrumb" });
  // public listede aynı servisi kullanıyorum sadece yayında olanlar gelsin
  const projects = await getProjects(locale);


  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        crumbs={[
          { label: b("home"), href: "/" },
          { label: t("title") },
        ]}
      />




      <div className="min-h-[20vh]">
        <ProjectShowcase projects={projects} fallbackImage={noPhoto.src} />
      </div>
    </>
  );
}

async function getProjects(locale: string) {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) return [];

  const response = await fetch(`${protocol}://${host}/api/admin/projects`, {
    cache: "no-store",
  });

  if (!response.ok) return [];

  const { projects = [] } = (await response.json()) as ProjectsResponse;
  const activeLocale = locale === "en" ? "en" : "tr";
  // seçili dilde içerik yoksa diğer dile düşmesi için
  const fallbackLocale = activeLocale === "en" ? "tr" : "en";

  return projects
    .filter((project) => project.is_published)
    .map((project) => {
      const translation =
        project.project_translations.find((item) => item.locale === activeLocale) ??
        project.project_translations.find((item) => item.locale === fallbackLocale);
      // kapak yoksa ilk foto kullanılması için
      const image =
        project.main_photo ??
        [...(project.project_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ??
        noPhoto.src;

      return {
        title: translation?.title ?? project.slug,
        description: translation?.description ?? "",
        metric: formatWeight(project.weight_tons, activeLocale),
        link: `/${locale}/projects#${project.slug}`,
        image,
      };
    });
}

function formatWeight(value: number | null, locale: Locale) {
  if (value === null) return "-";

  return `${new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value)} ton`;
}
