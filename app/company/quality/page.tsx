import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Kalite | Stallcons – Çelik Konstrüksiyon',
  description:
    'Stallcons kalite standartları ve sertifikaları. ISO belgeli üretim süreçleri ve uluslararası standartlarda çelik konstrüksiyon hizmetleri.',
};

export default function Page() {
  return (
    <>
      <PageHeader
        title="Kalite"
        description="Uluslararası standartlarda üretim ve kalite güvencesi"
        crumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Kurumsal', href: '/company/about-us' },
          { label: 'Kalite' },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        {/* İçerik buraya eklenecek */}
      </section>
    </>
  );
}
