import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'İletişim | Stallcons – Çelik Konstrüksiyon',
  description:
    'Stallcons ile iletişime geçin. Çelik konstrüksiyon, mühendislik ve tasarım hizmetlerimiz hakkında teklif almak için bize ulaşın.',
};

export default function Page() {
  return (
    <>
      <PageHeader
        title="İletişim"
        description="Projeleriniz için teklif alın, sorularınızı iletin"
        crumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'İletişim' },
        ]}
      />
      {/* sonra silinecek alan */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest mb-4">
            İletişim Sayfası Yakında
          </p>
          <h2 className="text-3xl font-bold mb-6">İletişim sayfası hazırlanıyor.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Bu sayfa için içerik çok yakında eklenecektir. Detaylı bilgi almak
            için lütfen bizimle iletişime geçin.
          </p>
        </div>
      </section>
    </>
  );
}
