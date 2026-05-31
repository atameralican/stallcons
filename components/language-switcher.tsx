'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === 'tr' ? 'en' : 'tr';
    router.replace(pathname, { locale: next });
  };

  return (
    <Button
      id="language-switcher"
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="rounded-full h-9 px-3 text-xs font-semibold tracking-wider transition-all hover:bg-accent"
      aria-label={locale === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
    >
      {locale === 'tr' ? 'EN' : 'TR'}
    </Button>
  );
}
