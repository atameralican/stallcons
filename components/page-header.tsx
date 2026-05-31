import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export type BreadcrumbEntry = {
  label: string;
  href?: string; // href yoksa aktif sayfa (BreadcrumbPage) olarak render edilir
};

type PageHeaderProps = {
  /** Sayfa büyük başlığı */
  title: string;
  /** Opsiyonel alt açıklama */
  description?: string;
  /** Breadcrumb öğeleri — ilk eleman genelde { label: 'Ana Sayfa', href: '/' } */
  crumbs: BreadcrumbEntry[];
  /** Arka plan resmi (opsiyonel) */
  backgroundImage?: string;
};

/**
 * Tüm iç sayfalarda kullanılacak başlık + breadcrumb bileşeni.
 * Google Search için BreadcrumbList JSON-LD schema otomatik eklenir.
 */
export function PageHeader({
  title,
  description,
  crumbs,
  backgroundImage = '/banner-bg.png',
}: PageHeaderProps) {
  return (
    <>
      {/* Banner */}
      <div className="px-4 sm:px-6" style={{ marginTop: '80px' }}>
        <section
          className="relative w-full overflow-hidden flex flex-col items-center justify-center rounded-3xl"
          style={{
            minHeight: '340px',
            marginTop: '24px',
          }}
        >
          <Image
            src={backgroundImage}
            alt={title ?? "Stallcons"}
            fill
            priority
            fetchPriority="high"
            className="object-cover object-[center_45%] z-0"
            sizes="100vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#2A3F58]/60 rounded-3xl z-0" />

          {/* İçerik */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-14 sm:py-18 gap-4">
            {/* Breadcrumb — banner içinde */}
            <Breadcrumb>
              <BreadcrumbList className="justify-center text-white/90 sm:gap-2">
                {crumbs.map((crumb, i) => {
                  const isLast = i === crumbs.length - 1;
                  return (
                    <React.Fragment key={i}>
                      <BreadcrumbItem>
                        {isLast || !crumb.href ? (
                          <BreadcrumbPage className="text-white/90 font-medium">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            asChild
                            className="text-white/90 hover:text-white transition-colors"
                          >
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && (
                        <BreadcrumbSeparator className="text-white/60" />
                      )}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>

            {/* Başlık */}
            <h1
              className="text-white text-4xl sm:text-5xl md:text-6xl text-center leading-none tracking-tight drop-shadow-lg font-bold"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}
            >
              {title}
            </h1>

            {/* Açıklama */}
            {description && (
              <p className="text-white/75 text-sm sm:text-base text-center max-w-xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
