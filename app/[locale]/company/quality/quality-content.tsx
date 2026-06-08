"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

function fade(delay = 0, reduced: boolean | null) {
  const r = !!reduced;
  return {
    initial: { opacity: r ? 1 : 0, y: r ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: r ? 0 : 0.65, ease: [0.16, 1, 0.3, 1], delay: r ? 0 : delay },
  } as const;
}

export function QualityContent() {
  const t = useTranslations("Pages.quality");
  const reduced = useReducedMotion();

  const pillars = [
    { title: t("pillar1Title"), desc: t("pillar1Desc") },
    { title: t("pillar2Title"), desc: t("pillar2Desc") },
    { title: t("pillar3Title"), desc: t("pillar3Desc") },
    { title: t("pillar4Title"), desc: t("pillar4Desc") },
  ];

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <section className="bg-zinc-200 py-16 dark:bg-zinc-800 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-3xl">
            <motion.h2
              className="text-balance text-3xl font-bold leading-tight md:text-4xl lg:text-5xl"
              {...fade(0, reduced)}
            >
              {t("introHeading")}
            </motion.h2>
            <motion.p
              className="mt-6 text-base leading-relaxed text-muted-foreground"
              {...fade(0.1, reduced)}
            >
              {t("introBody1")}
            </motion.p>
            <motion.p
              className="mt-4 text-base leading-relaxed text-muted-foreground"
              {...fade(0.18, reduced)}
            >
              {t("introBody2")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Pillars ────────────────────────────────────────────── */}
      <section className="bg-zinc-200 py-16 dark:bg-zinc-800 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.h2
            className="mb-6 text-2xl font-bold md:text-3xl"
            {...fade(0, reduced)}
          >
            {t("pillarsHeading")}
          </motion.h2>

          <div className="flex flex-col divide-y divide-border">
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                className="grid gap-4 py-4 sm:py-8 sm:grid-cols-[2fr_3fr] sm:gap-12"
                {...fade(i * 0.08, reduced)}
              >
                <h3 className="text-xl font-bold leading-snug md:text-2xl">
                  {pillar.title}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
