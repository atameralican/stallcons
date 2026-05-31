import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Tüm rotaları yakala ama Next.js dahili dosyaları hariç tut
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
