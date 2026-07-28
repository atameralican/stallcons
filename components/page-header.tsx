import React from 'react';
import Image, { type ImageProps } from 'next/image';
import bannerImage from '@/public/banner-bg.webp';
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
  href?: string; // link yoksa aktif sayfa
};

type PageHeaderProps = {
  /** sayfa başlığı */
  title: string;
  /** alt açıklama */
  description?: string;
  /** sayfa yolu */
  crumbs: BreadcrumbEntry[];
  /** arka plan görseli */
  backgroundImage?: ImageProps['src'];
};

/** iç sayfa başlığı */
export function PageHeader({
  title,
  description,
  crumbs,
  backgroundImage = bannerImage,
}: PageHeaderProps) {
  return (
    <>
      {/* banner */}
      <div className="px-4 sm:px-6 mt-5" >
        <section
          className="relative flex min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl sm:min-h-[340px]"
          style={{
            marginTop: '24px',
          }}
        >
          <Image
            src={backgroundImage}
            alt=""
            fill
            preload
            fetchPriority="high"
            className="z-0 scale-150 object-cover object-[center_45%] sm:scale-100"
            sizes="(max-width: 639px) calc(100vw - 32px), calc(100vw - 48px)"
          />
          {/* karartma */}
          <div className="absolute inset-0 bg-[#2A3F58]/60 rounded-3xl z-0" />

          {/* içerik */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-14 sm:py-18 gap-4">
            {/* sayfa yolu */}
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

            {/* başlık */}
            <h1
              className="text-white text-4xl sm:text-5xl md:text-6xl text-center leading-none tracking-tight drop-shadow-lg font-bold"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}
            >
              {title}
            </h1>

            {/* açıklama */}
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
