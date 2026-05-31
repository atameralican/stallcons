import type { ReactNode } from "react";

/**
 * Root layout — Next.js'in gerektirdiği minimal shell.
 * Tüm gerçek layout mantığı app/[locale]/layout.tsx'dedir.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
