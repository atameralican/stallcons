import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/** dil bilgisini koruyan yönlendirmeler */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
