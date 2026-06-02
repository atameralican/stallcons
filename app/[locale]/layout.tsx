import type { Metadata } from "next";
import { Barlow, Source_Sans_3 } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import Footer from "@/components/footer";

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stallcons – Çelik Konstrüksiyon",
  description:
    "Stallcons | Tasarım, imalat, montaj ve mühendislik alanlarında profesyonel çelik konstrüksiyon çözümleri.",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Geçersiz locale → 404
  if (!routing.locales.includes(locale as "tr" | "en")) {
    notFound();
  }

  // Tüm mesajları istemci bileşenlerine aktar
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        sourceSans.variable,
        barlow.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="relative z-10 pb-12 flex-1 bg-zinc-200 dark:bg-zinc-800 min-h-svh rounded-b-[2.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.7)]">
              {children}
            </main>
            < Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
