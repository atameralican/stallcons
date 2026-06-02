"use client"

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    GitHubLogoIcon,
    DiscordLogoIcon,
    FigmaLogoIcon,
    VercelLogoIcon,
    NotionLogoIcon,
    TwitterLogoIcon,
    InstagramLogoIcon,
    LinkedInLogoIcon,
    CodeSandboxLogoIcon,
    SketchLogoIcon,
    StitchesLogoIcon,
    FramerLogoIcon,
} from '@radix-ui/react-icons';

const brands = [
    { id: 'github', name: 'GitHub', Icon: GitHubLogoIcon },
    { id: 'discord', name: 'Discord', Icon: DiscordLogoIcon },
    { id: 'figma', name: 'Figma', Icon: FigmaLogoIcon },
    { id: 'vercel', name: 'Vercel', Icon: VercelLogoIcon },
    { id: 'notion', name: 'Notion', Icon: NotionLogoIcon },
    { id: 'twitter', name: 'Twitter', Icon: TwitterLogoIcon },
    { id: 'instagram', name: 'Instagram', Icon: InstagramLogoIcon },
    { id: 'linkedin', name: 'LinkedIn', Icon: LinkedInLogoIcon },
    { id: 'codesandbox', name: 'CodeSandbox', Icon: CodeSandboxLogoIcon },
    { id: 'sketch', name: 'Sketch', Icon: SketchLogoIcon },
    { id: 'stitches', name: 'Stitches', Icon: StitchesLogoIcon },
    { id: 'framer', name: 'Framer', Icon: FramerLogoIcon },
];

export default function HoverBrandLogo() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const activeBrand = brands.find(b => b.id === hoveredId);

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

            {/* Right: icon grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:flex md:flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 w-full md:w-auto mt-6 md:mt-0 max-w-2xl">
                {brands.map(({ id, name, Icon }) => {
                    const isActive = hoveredId === id;
                    const isDimmed = hoveredId !== null && !isActive;
                    return (
                        <button
                            key={id}
                            aria-label={name}
                            className={[
                                'flex items-center justify-center p-2.5 sm:p-3 lg:p-3.5 rounded-lg border transition-all duration-200',
                                isActive
                                    ? 'border-foreground/30 text-foreground bg-foreground/5'
                                    : 'border-transparent text-foreground/30 hover:text-foreground/50',
                                isDimmed ? 'opacity-40 ' : '',
                            ].join(' ')}
                            onMouseEnter={() => setHoveredId(id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <Icon className="w-8 h-8 sm:w-6 sm:h-6" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
