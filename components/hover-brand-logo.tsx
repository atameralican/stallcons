"use client"

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type HomePartner = {
    id: string;
    name: string;
    url: string;
};

type HoverBrandLogoProps = {
    partners: HomePartner[];
};

export default function HoverBrandLogo({ partners }: HoverBrandLogoProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    if (!partners || partners.length === 0) {
        return null;
    }

    const activeBrand = partners.find(b => b.id === hoveredId);

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 lg:gap-16 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Left: text */}
            <div className="flex-shrink-0 w-full md:w-auto text-center md:text-left">
                <p className="text-sm sm:text-base text-muted-foreground font-medium mb-0 tracking-tight">
                    Değerli
                </p>
                <div className="relative">
                    <p
                        aria-hidden
                        className="text-3xl lg:text-3xl font-bold tracking-tight whitespace-nowrap opacity-0 pointer-events-none select-none leading-none sm:leading-tight"
                    >
                        iş ortaklarımız
                    </p>
                    <div className="absolute inset-0 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={hoveredId ?? 'default'}
                                initial={{ y: 16, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -16, opacity: 0 }}
                                transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-none sm:leading-tight tracking-tight whitespace-nowrap"
                            >
                                {activeBrand?.name ?? 'iş ortaklarımız'}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Right: image grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 w-full md:w-auto mt-6 md:mt-0 max-w-2xl">
                {partners.map((partner) => {
                    const isActive = hoveredId === partner.id;
                    const isDimmed = hoveredId !== null && !isActive;
                    return (
                        <div
                            key={partner.id}
                            className={cn(
                                'flex items-center justify-center p-3 rounded-2xl border transition-all duration-200 w-28 h-16 sm:w-32 sm:h-20 bg-white dark:bg-zinc-100 shadow-sm',
                                isActive
                                    ? 'border-zinc-300 bg-white'
                                    : 'border-zinc-200 hover:border-zinc-300',
                                isDimmed && 'opacity-40'
                            )}
                            onMouseEnter={() => setHoveredId(partner.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <img
                                src={partner.url}
                                alt={partner.name}
                                className={cn(
                                    "max-h-full max-w-full object-contain transition-all duration-200",
                                    isActive
                                        ? "grayscale-0 opacity-100"
                                        : "grayscale opacity-60"
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

