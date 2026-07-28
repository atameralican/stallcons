import { Navbar } from "@/components/navbar";
import type { NavbarActivityAreaLink } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import Footer from "@/components/footer";
import { getActivityAreasData } from "@/lib/data/content";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

type Locale = "tr" | "en";

type ActivityAreaTranslation = {
  locale: Locale | "es";
  title: string;
  subtitle: string | null;
  description: string | null;
  slug: string;
};

type ActivityAreaRecord = {
  id: string;
  is_active: boolean;
  sort_order: number;
  activity_area_translations: ActivityAreaTranslation[];
};

// public sayfalara dil tema menü ve footer ekliyorum
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "tr" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const activityAreaLinks = await getNavbarActivityAreas(locale as Locale);

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-full flex flex-col">
          <Navbar activityAreaLinks={activityAreaLinks} />

          <main className="relative z-10 pb-12 flex-1 bg-zinc-200 dark:bg-zinc-800 min-h-svh rounded-b-[2.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.7)]">
            {children}
          </main>

          <Footer />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

// menüde gösterilecek faaliyet alanlarını alıyorum
async function getNavbarActivityAreas(locale: Locale): Promise<NavbarActivityAreaLink[]> {
  const { data, error } = await getActivityAreasData();
  if (error) return [];

  return data
    .filter((activityArea) => activityArea.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((activityArea) => mapActivityAreaForNavbar(activityArea, locale))
    .filter((activityArea): activityArea is NavbarActivityAreaLink => Boolean(activityArea));
}

function mapActivityAreaForNavbar(activityArea: ActivityAreaRecord, locale: Locale): NavbarActivityAreaLink | null {
  const currentTranslation = activityArea.activity_area_translations.find((item) => item.locale === locale);
  const fallbackTranslation = activityArea.activity_area_translations.find((item) => item.locale === "tr")
    ?? activityArea.activity_area_translations.find((item) => item.locale === "en");
  const translation = currentTranslation ?? fallbackTranslation;

  if (!translation?.title || !translation.slug) return null;

  return {
    title: translation.title,
    description: translation.subtitle ?? translation.description ?? "",
    href: `/expertise-areas/${translation.slug}`,
  };
}
