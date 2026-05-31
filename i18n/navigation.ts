import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation yardımcıları.
 * Bu Link bileşenini next/link yerine kullanın — locale prefix'i otomatik ekler.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
