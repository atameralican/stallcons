import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Middleware tarafından belirlenen locale'i al
  let locale = await requestLocale;

  // Geçersiz bir locale gelirse varsayılana dön
  if (!locale || !routing.locales.includes(locale as 'tr' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
