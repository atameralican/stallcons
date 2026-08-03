"use client";

import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from "next/image";
import { Link } from '@/i18n/navigation';
import { ArrowUpRight } from 'lucide-react';

export interface GalleryData {
    id: string;
    name: string;
    role: string;
    href: Parameters<typeof Link>[0]['href'];
    image: string;
}

interface GalleryShowcaseProps {
    datas: GalleryData[];
}

// faaliyet alanlarını görsel kartlarla gösteriyorum
export default function GalleryShowcase({ datas }: GalleryShowcaseProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    if (datas.length === 0) return null;

    // üç kolonlu görünüm
    const col1 = datas.filter((_, i) => i % 3 === 0);
    const col2 = datas.filter((_, i) => i % 3 === 1);
    const col3 = datas.filter((_, i) => i % 3 === 2);

    // iki kolonlu görünüm
    const twoCol1 = datas.filter((_, i) => i % 2 === 0);
    const twoCol2 = datas.filter((_, i) => i % 2 === 1);

    return (
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10 lg:gap-14 select-none w-full max-w-5xl mx-auto py-8 px-4 md:px-6 font-sans">


            {/* iki kolon */}
            <div className="flex gap-2 flex-shrink-0 pb-1 min-[390px]:hidden mx-auto">
                <div className="flex flex-col gap-2">
                    {twoCol1.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[140px]"
                            sizes="140px"
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
                            className="w-[140px]"
                            sizes="140px"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>
            </div>

            {/* üç kolon */}
            <div className="hidden min-[390px]:flex gap-2 md:gap-3 flex-shrink-0 pb-1 md:pb-0">
                {/* ilk kolon */}
                <div className="flex flex-col gap-2 md:gap-3">
                    {col1.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[110px] sm:w-[130px] md:w-[155px]"
                            sizes="(max-width: 639px) 110px, (max-width: 767px) 130px, 155px"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>

                {/* ikinci kolon */}
                <div className="flex flex-col gap-2 md:gap-3 mt-[48px] sm:mt-[56px] md:mt-[68px]">
                    {col2.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[122px] sm:w-[145px] md:w-[172px]"
                            sizes="(max-width: 639px) 122px, (max-width: 767px) 145px, 172px"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>

                {/* üçüncü kolon */}
                <div className="flex flex-col gap-2 md:gap-3 mt-[22px] sm:mt-[26px] md:mt-[32px]">
                    {col3.map((data) => (
                        <PhotoCard
                            key={data.id}
                            data={data}
                            className="w-[115px] sm:w-[136px] md:w-[162px]"
                            sizes="(max-width: 639px) 115px, (max-width: 767px) 136px, 162px"
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    ))}
                </div>
            </div>

            {/* başlık listesi */}
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

// görsel kartı

function PhotoCard({
    data,
    className,
    sizes,
    hoveredId,
    onHover,
}: {
    data: GalleryData;
    className: string;
    sizes: string;
    hoveredId: string | null;
    onHover: (id: string | null) => void;
}) {
    const isActive = hoveredId === data.id;
    const isDimmed = hoveredId !== null && !isActive;

    return (
        <Link
            href={data.href}
            className={cn(
                'group relative aspect-[14/15] overflow-hidden rounded-xl cursor-pointer flex-shrink-0 transition-all duration-500 block bg-white/20 shadow-sm ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10',
                className,
                isActive && 'shadow-lg ring-black/10 dark:ring-white/20',
                isDimmed ? 'opacity-75' : 'opacity-100',
            )}
            onMouseEnter={() => onHover(data.id)}
            onMouseLeave={() => onHover(null)}
        >
            <Image
                src={data.image}
                alt={data.name}
                fill
                sizes={sizes}
                className="object-cover transition-[filter,transform] duration-500 group-hover:scale-[1.035]"
                style={{
                    filter: isActive
                        ? 'saturate(1.08) contrast(1.04) brightness(1.02)'
                        : isDimmed
                            ? 'saturate(0.78) contrast(0.92) brightness(0.88)'
                            : 'saturate(0.86) contrast(0.96) brightness(0.94)',
                }}
            />
        </Link>
    );
}

// başlık satırı

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
            href={data.href}
            className={cn(
                'cursor-pointer transition-opacity duration-300 block',
                isDimmed ? 'opacity-50' : 'opacity-100',
            )}
            onMouseEnter={() => onHover(data.id)}
            onMouseLeave={() => onHover(null)}
        >
            {/* başlık */}
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

            {/* açıklama */}
            <p className="mt-1.5 pl-[27px] text-xs md:text-sm font-medium text-muted-foreground">
                {data.role}
            </p>
        </Link>
    );
}
