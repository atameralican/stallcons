"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
    LinkedInLogoIcon,
    TwitterLogoIcon,
    GitHubLogoIcon,
} from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";

import React from "react";
// --- Reveal yüksekliği artık dinamik hesaplanacak ---

const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Footer() {
    const t = useTranslations("Navbar");
    const [footerHeight, setFooterHeight] = React.useState(350); // Varsayılan başlangıç yüksekliği
    const footerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!footerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setFooterHeight(entry.target.getBoundingClientRect().height);
            }
        });
        observer.observe(footerRef.current);
        return () => observer.disconnect();
    }, []);

    const REVEAL = `${footerHeight}px`;

    const socialLinks = [
        { icon: <TwitterLogoIcon className="w-5 h-5" />, href: "https://twitter.com", label: "Twitter" },
        { icon: <LinkedInLogoIcon className="w-5 h-5" />, href: "https://linkedin.com", label: "LinkedIn" },
    ];

    const navLinks = [
        { label: "home", href: "/" },
        { label: "projects", href: "/projects" },
        { label: "contact", href: "/contact" },
    ];

    return (
        <div
            className="relative"
            style={{
                height: REVEAL,
                clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
            }}
        >
            {/* Parallax reveal sahnesi */}
            <div className="relative -top-[100vh]" style={{ height: `calc(100vh + ${REVEAL})` }}>
                <div className="sticky" style={{ top: `calc(100vh - ${REVEAL})` }}>
                    {/* İçerik tam REVEAL yüksekliğinde, dibe yaslı */}
                    <motion.footer
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={container}
                        className="bg-background flex flex-col justify-end overflow-hidden"
                        style={{ height: REVEAL }}
                    >
                        <div ref={footerRef} className="w-full flex flex-col">
                            <div className="mx-auto w-full max-w-7xl px-4 md:px-12 pb-2">
                                {/* ÜST: 3 kolonlu bar */}
                                <motion.div
                                    variants={item}
                                    className="grid grid-cols-3 items-start gap-4 pt-10"
                                >
                                    {/* SOL — Copyright */}
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        ©2026 stallcons.
                                        <br />
                                        All rights reserved.
                                    </p>

                                    {/* ORTA — Marka + sosyal + nav */}
                                    <div className="flex flex-col items-center gap-2">
                                        {/* <span className="text-xl font-bold tracking-tight text-foreground">
                                        stallcons.com
                                    </span>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Steel Construction
                                    </span> */}

                                        <div className="mt-1 flex gap-4">
                                            {socialLinks.map((link) => (
                                                <Link
                                                    key={link.label}
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={link.label}
                                                    className="text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-foreground"
                                                >
                                                    {link.icon}
                                                </Link>
                                            ))}
                                        </div>

                                        <nav className="mt-1 flex flex-wrap justify-center gap-4 text-base font-medium text-muted-foreground">
                                            {navLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className="transition-colors duration-300 hover:font-semibold hover:text-foreground"
                                                >
                                                    {t(link.label)}
                                                </Link>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* SAĞ — Yapımcı */}
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <Link
                                            href="https://www.linkedin.com/in/alican-atamer/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-muted-foreground transition-colors duration-300 hover:font-medium hover:text-foreground"
                                        >
                                            Developed by Alican ATAMER
                                        </Link>
                                        <div className="flex gap-4">
                                            <Link
                                                href="https://www.linkedin.com/in/alican-atamer/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="LinkedIn"
                                                className="text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-foreground"
                                            >
                                                <LinkedInLogoIcon className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href="https://github.com/atameralican"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="GitHub"
                                                className="text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-foreground"
                                            >
                                                <GitHubLogoIcon className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* ÇİZGİ */}
                                <motion.div
                                    variants={item}
                                    className="mt-6 mb-2 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"
                                />

                                {/* ALT: Dev STALLCONS — zemin */}
                                <motion.div
                                    variants={item}
                                    aria-hidden="true"
                                    className="pointer-events-none select-none bg-gradient-to-b from-foreground/25 via-foreground/10 to-transparent bg-clip-text text-center font-extrabold leading-[0.85] tracking-tighter text-transparent"
                                    style={{ fontSize: "clamp(3rem, 13vw, 11rem)" }}
                                >
                                    STALLCONS
                                </motion.div>
                            </div>
                        </div>
                    </motion.footer>
                </div>
            </div>
        </div>
    );
}