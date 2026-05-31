import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Hakkımızda | Stallcons – Çelik Konstrüksiyon',
  description:
    'Stallcons hakkında daha fazla bilgi edinin. Çelik konstrüksiyon alanında yılların deneyimiyle profesyonel mühendislik ve yapım hizmetleri sunuyoruz.',
};

export default function Page() {
  return (
    <>
      <PageHeader
        title="Hakkımızda"
        description="Çelik konstrüksiyon alanında güvenilir çözüm ortağınız"
        crumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Kurumsal', href: '/company/about-us' },
          { label: 'Hakkımızda' },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        {/* İçerik buraya eklenecek */}
      </section>
    </>
  );
}
