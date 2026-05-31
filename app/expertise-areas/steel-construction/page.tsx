import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Çelik Konstrüksiyon | Stallcons – Faaliyet Alanları',
  description:
    'Stallcons çelik konstrüksiyon hizmetleri: Tasarım, imalat ve montaj. Endüstriyel yapılar, çelik çatılar ve hafif çelik sistemler alanında uzman ekip.',
};

export default function Page() {
  return (
    <>
      <PageHeader
        title="Çelik Konstrüksiyon"
        description="Tasarımdan montaja kadar uçtan uca çelik konstrüksiyon çözümleri"
        crumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Faaliyet Alanlarımız', href: '/expertise-areas/steel-construction' },
          { label: 'Çelik Konstrüksiyon' },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        {/* İçerik buraya eklenecek */}
      </section>
    </>
  );
}
