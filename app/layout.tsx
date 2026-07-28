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
  metadataBase: new URL("https://stallcons.com"),
  title: {
    default: "Stallcons – Çelik Konstrüksiyon",
    template: "%s | Stallcons",
  },
  description:
    "Stallcons | Tasarım, imalat, montaj ve mühendislik alanlarında profesyonel çelik konstrüksiyon çözümleri.",
  applicationName: "Stallcons",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Stallcons",
  url: "https://stallcons.com",
  logo: "https://stallcons.com/brand/stallcons-organization-logo-512.png",
  email: "info@stallcons.com",
  sameAs: ["https://www.linkedin.com/company/stallcons"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
