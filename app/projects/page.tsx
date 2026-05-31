import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Projeler | Stallcons – Çelik Konstrüksiyon',
  description:
    'Stallcons tamamlanan ve devam eden projeleri. Endüstriyel yapılar, çelik çatılar ve konstrüksiyon projelerimize göz atın.',
};

export default function Page() {
  return (
    <>
      <PageHeader
        title="Projeler"
        description="Tamamlanan ve devam eden çelik konstrüksiyon projelerimiz"
        crumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Projeler' },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        {/* İçerik buraya eklenecek */}
      </section>
    </>
  );
}
