import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Barlow, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import "./globals.css";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        sourceSans.variable,
        barlow.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}