"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";

const MESSAGES: Record<string, string[]> = {
    tr: [
        "STALLCONS\nSTEEL REDEFINED\nÇELİĞİN YENİ STANDARDI",
        "AĞIR SANAYİ\nMADEN EKİPMANLARI\nAĞIR HİZMET ÇELİK YAPILARI",
        "SAVUNMA SANAYİ\nTEKNİK KOORDİNASYON\nÇELİK YAPI ÇÖZÜMLERİ",
        "UYGULANABİLİR TASARIM\nHASSAS ÜRETİM\nSAHA ODAKLI MÜHENDİSLİK",
        "PROJE STANDARTLARI\nKONTROLLÜ ÜRETİM\nDOKÜMANTE EDİLEN SÜREÇ",
    ],
    en: [
        "STALLCONS\nINNOVATIVE DESIGN\nTHE NEW STANDARD IN STEEL",
        "HEAVY INDUSTRY\nMINING EQUIPMENT\nHEAVY DUTY STEEL STRUCTURES",
        "DEFENSE PROJECTS\nTECHNICAL COORDINATION\nSTRUCTURAL STEEL SOLUTIONS",
        "BUILDABLE DESIGN\nPRECISION FABRICATION\nSITE-FOCUSED ENGINEERING",
        "PROJECT STANDARDS\nCONTROLLED FABRICATION\nDOCUMENTED PROCESSES",
    ],
};

// ana sayfadaki hareketli giriş alanı
export function HomeHero({ locale }: { locale: string }) {
    const msgs = MESSAGES[locale] ?? MESSAGES.tr;
    const [msgIdx, setMsgIdx] = useState(0);
    const [animationReady, setAnimationReady] = useState(false);
    const [heroVisible, setHeroVisible] = useState(true);
    const [pageVisible, setPageVisible] = useState(true);
    const heroRef = useRef<HTMLDivElement>(null);
    const startedRef = useRef(false);
    const reducedMotion = useReducedMotion();
    const next = useCallback(() => setMsgIdx((i) => (i + 1) % msgs.length), [msgs.length]);

    // hero ekrandan çıkınca animasyonu durduruyorum
    useEffect(() => {
        if (!heroRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => setHeroVisible(entry.isIntersecting),
            { threshold: 0.1 },
        );

        observer.observe(heroRef.current);
        return () => observer.disconnect();
    }, []);

    // sekme arka plandaysa sayacı durduruyorum
    useEffect(() => {
        const updateVisibility = () => setPageVisible(!document.hidden);

        updateVisibility();
        document.addEventListener("visibilitychange", updateVisibility);
        return () => document.removeEventListener("visibilitychange", updateVisibility);
    }, []);

    // ilk mesajı statik tutup yükleme sonrası animasyonu hazırlıyorum
    useEffect(() => {
        if (reducedMotion) return;

        let delayId: number | undefined;
        let idleId: number | undefined;
        let cancelled = false;

        const prepareAnimation = () => {
            const idleWindow = window as Window & {
                requestIdleCallback?: (
                    callback: () => void,
                    options?: { timeout: number },
                ) => number;
                cancelIdleCallback?: (id: number) => void;
            };
            const startDelay = () => {
                delayId = window.setTimeout(() => {
                    if (!cancelled) setAnimationReady(true);
                }, 3000);
            };

            if (idleWindow.requestIdleCallback) {
                idleId = idleWindow.requestIdleCallback(startDelay, { timeout: 2000 });
            } else {
                startDelay();
            }
        };

        if (document.readyState === "complete") {
            prepareAnimation();
        } else {
            window.addEventListener("load", prepareAnimation, { once: true });
        }

        return () => {
            cancelled = true;
            window.removeEventListener("load", prepareAnimation);
            if (delayId !== undefined) window.clearTimeout(delayId);

            const idleWindow = window as Window & {
                cancelIdleCallback?: (id: number) => void;
            };
            if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
        };
    }, [reducedMotion]);

    // hazır olduğunda ikinci mesaja geçip normal aralığı başlatıyorum
    useEffect(() => {
        if (!animationReady || reducedMotion || !heroVisible || !pageVisible) return;

        if (!startedRef.current) {
            startedRef.current = true;
            next();
        }

        const id = window.setInterval(next, 12000);
        return () => window.clearInterval(id);
    }, [animationReady, heroVisible, next, pageVisible, reducedMotion]);

    return (
        <div
            ref={heroRef}
            className="flex min-h-dvh sm:min-h-screen flex-col items-center justify-center px-4 py-10-"
        >
            <TextFlippingBoard
                text={msgs[msgIdx]}
                animate={animationReady && !reducedMotion}
            />
            <div className="mt-10 flex flex-col items-center text-center">
                <h1 className="select-none text-[16vw] font-black uppercase tracking-[-0.08em] leading-none sm:text-[12vw] lg:text-[10rem]">
                    STALLCONS
                </h1>
                <div className="mt-2 h-[2px] w-32 bg-neutral-700" />
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
                    {locale === "tr"
                        ? "Çeliği projeden sahaya taşıyan mühendislik, imalat ve montaj çözümleri."
                        : "Engineering, fabrication and installation solutions that bring steel structures from design to site."}
                </p>
            </div>
        </div>
    );
}
