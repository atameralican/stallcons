import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Misyon & Vizyon | Stallcons – Çelik Konstrüksiyon',
  description:
    "Stallcons'un misyonu ve vizyonu. Sürdürülebilir çelik konstrüksiyon çözümleriyle Türkiye'nin önde gelen mühendislik firması olmayı hedefliyoruz.",
};

export default function Page() {
  return (
    <>
      <PageHeader
        title="Misyon & Vizyon"
        description="Geleceği inşa etme yolculuğumuzda bizi yönlendiren değerler"
        crumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Kurumsal', href: '/company/about-us' },
          { label: 'Misyon & Vizyon' },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        {/* İçerik buraya eklenecek */}
      </section>
    </>
  );
}
