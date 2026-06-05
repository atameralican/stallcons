"use client";

import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight } from 'lucide-react';

export interface GalleryData {
    id: string;
    name: string;
    role: string;
    href: string;
    image: string;
}

const ITEMS_CONFIG = [
    {
        id: '1',
        translationKey: 'engineeringDesign' as const,
        href: '/expertise-areas/engineering-design',
        image: 'https://fastly.picsum.photos/id/845/536/354.jpg?hmac=N0jid6KpFZyaCJhFdFJVRQUImWIJuxYl53n3GkFj9Ps',
    },
    {
        id: '2',
        translationKey: 'steelConstruction' as const,
        href: '/expertise-areas/steel-construction',
        image: 'https://fastly.picsum.photos/id/28/4928/3264.jpg?hmac=GnYF-RnBUg44PFfU5pcw_Qs0ReOyStdnZ8MtQWJqTfA'
    },
    {
        id: '3',
        translationKey: 'consulting' as const,
        href: '/expertise-areas/consulting',
        image: 'https://fastly.picsum.photos/id/76/367/267.jpg?hmac=Jh_us_gqJLuNJOhki3d6cVGyA4OsoiID7bhwIoooi48',
    },
    {
        id: '4',
        translationKey: 'qualityControl' as const,
        href: '/expertise-areas/quality-control',
        image: 'https://fastly.picsum.photos/id/16/367/267.jpg?hmac=ZyyuET1a6X-Ym6MXK8OyHrdWFJiLI4To0iYLTlyrD-0',
    },
    {
        id: '5',
        translationKey: 'defense' as const,
        href: '/expertise-areas/defense',
        image: 'https://fastly.picsum.photos/id/9/367/267.jpg?hmac=T7owcj6NXY0SJiB-H1XxauCZKaZJkkXWOEQw8GZseAc',
    },
    {
        id: '6',
        translationKey: 'craneSystems' as any,
        href: '/expertise-areas/crane-systems',
        image: 'https://fastly.picsum.photos/id/63/367/267.jpg?hmac=v7Io1SRLfeajvMXPM49T9R2ScLVsYEXzclwdxNtABTk',
    },
];

interface GalleryShowcaseProps {
    datas?: GalleryData[];
}

export default function GalleryShowcase({ datas: externalDatas }: GalleryShowcaseProps) {
    const t = useTranslations("ExpertiseLinks");
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const datas: GalleryData[] = externalDatas || ITEMS_CONFIG.map(item => ({
        id: item.id,
        name: t(`${item.translationKey}.title`),
        role: t(`${item.translationKey}.description`),
        href: item.href,
        image: item.image,
    }));

    // 3-column layout (>= 390px)
    const col1 = datas.filter((_, i) => i % 3 === 0);
    const col2 = datas.filter((_, i) => i % 3 === 1);
    const col3 = datas.filter((_, i) => i % 3 === 2);

    // 2-column layout (< 390px)
    const twoCol1 = datas.filter((_, i) => i % 2 === 0);
    const twoCol2 = datas.filter((_, i) => i % 2 === 1);

    return (
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10 lg:gap-14 select-none w-full max-w-5xl mx-auto py-8 px-4 md:px-6 font-sans">
            {/* ── Left: photo grid ── */}

            {/* 2-column grid (< 390px) */}
            <div className="flex gap-2 flex-shrink-0 pb-1 min-[390px]:hidden mx-auto">
                <div className="flex flex-col gap-2">
                    {twoCol1.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[140px] h-[150px]"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>
                <div className="flex flex-col gap-2 mt-[36px]">
                    {twoCol2.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[140px] h-[150px]"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>
            </div>

            {/* 3-column grid (>= 390px) */}
            <div className="hidden min-[390px]:flex gap-2 md:gap-3 flex-shrink-0 pb-1 md:pb-0">
                {/* Column 1 */}
                <div className="flex flex-col gap-2 md:gap-3">
                    {col1.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[110px] h-[120px] sm:w-[130px] sm:h-[140px] md:w-[155px] md:h-[165px]"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-2 md:gap-3 mt-[48px] sm:mt-[56px] md:mt-[68px]">
                    {col2.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[122px] h-[132px] sm:w-[145px] sm:h-[155px] md:w-[172px] md:h-[182px]"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-2 md:gap-3 mt-[22px] sm:mt-[26px] md:mt-[32px]">
                    {col3.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[115px] h-[125px] sm:w-[136px] sm:h-[146px] md:w-[162px] md:h-[172px]"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>
            </div>

            {/* ── Right: data name list*/}
            <div className="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-4 md:gap-5 pt-0 md:pt-2 flex-1 w-full">
                {datas.map((data) => (
                    <DataRow
                        key={data.id}
                        data={data}
                        hoveredId={hoveredId}
                        onHover={setHoveredId}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   Photo card 
───────────────────────────────────────── */

function PhotoCard({
    data,
    className,
    hoveredId,
    onHover,
}: {
    data: GalleryData;
    className: string;
    hoveredId: string | null;
    onHover: (id: string | null) => void;
}) {
    const isActive = hoveredId === data.id;
    const isDimmed = hoveredId !== null && !isActive;

    return (
        <Link
            href={data.href as any}
            className={cn(
                'overflow-hidden rounded-xl cursor-pointer flex-shrink-0 transition-opacity duration-400 block',
                className,
                isDimmed ? 'opacity-60' : 'opacity-100',
            )}
            onMouseEnter={() => onHover(data.id)}
            onMouseLeave={() => onHover(null)}
        >
            <Image
                src={data.image}
                alt={data.name}
                width={500}
                height={500}
                //width height değişebilir.
                // fill
                className="w-full h-full object-cover transition-[filter] duration-500"
                style={{
                    filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.77)',
                }}
            />
        </Link>
    );
}

/* ─────────────────────────────────────────
   Data name section
───────────────────────────────────────── */

function DataRow({
    data,
    hoveredId,
    onHover,
}: {
    data: GalleryData;
    hoveredId: string | null;
    onHover: (id: string | null) => void;
}) {
    const isActive = hoveredId === data.id;
    const isDimmed = hoveredId !== null && !isActive;

    return (
        <Link
            href={data.href as any}
            className={cn(
                'cursor-pointer transition-opacity duration-300 block',
                isDimmed ? 'opacity-50' : 'opacity-100',
            )}
            onMouseEnter={() => onHover(data.id)}
            onMouseLeave={() => onHover(null)}
        >
            {/* Name */}
            <div className="flex items-center gap-2.5">
                <span
                    className={cn(
                        'w-4 h-3 rounded-[5px] flex-shrink-0 transition-all duration-300',
                        isActive ? 'bg-foreground w-5' : 'bg-foreground/25',
                    )}
                />
                <span
                    className={cn(
                        'text-base md:text-[18px] font-semibold leading-none tracking-tight transition-colors duration-300 flex items-center',
                        isActive ? 'text-foreground' : 'text-foreground/80',
                    )}
                >
                    {data.name}
                    <ArrowUpRight
                        className={cn(
                            "w-4 h-4 ml-1 transition-all duration-300",
                            isActive ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-1 translate-y-1"
                        )}
                    />
                </span>
            </div>

            {/* Role */}
            <p className="mt-1.5 pl-[27px] text-[7px] md:text-[10px] font-medium capitalize tracking-[0.2em] text-muted-foreground">
                {data.role}
            </p>
        </Link>
    );
}
