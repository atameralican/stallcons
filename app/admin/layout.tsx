import type { Metadata } from "next";
import type { ReactNode } from "react";
import { barlow, sourceSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import "../globals.css";

export const metadata: Metadata = {
  title: "Stallcons Admin",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
    },
  },
};

// admin public metadata ve şemalardan ayrı kalıyor
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        sourceSans.variable,
        barlow.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
