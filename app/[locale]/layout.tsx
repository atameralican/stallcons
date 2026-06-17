import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import Footer from "@/components/footer";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "tr" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-full flex flex-col">
          <Navbar />

          <main className="relative z-10 pb-12 flex-1 bg-zinc-200 dark:bg-zinc-800 min-h-svh rounded-b-[2.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.7)]">
            {children}
          </main>

          <Footer />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}