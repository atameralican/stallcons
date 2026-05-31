import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Mühendislik & Tasarım | Stallcons – Faaliyet Alanları',
  description:
    'Stallcons mühendislik ve tasarım hizmetleri: Statik hesaplar, 3D modelleme, yapısal analiz ve proje yönetimi. Deneyimli mühendis ekibiyle güvenilir çözümler.',
};

export default function Page() {
  return (
    <>
      <PageHeader
        title="Mühendislik & Tasarım"
        description="Statik hesaptan 3D modellemeye, projelerinizi güvenle tasarlıyoruz"
        crumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Faaliyet Alanlarımız', href: '/expertise-areas/steel-construction' },
          { label: 'Mühendislik & Tasarım' },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        {/* İçerik buraya eklenecek */}
      </section>
    </>
  );
}
