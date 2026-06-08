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

export function MissionVisionContent() {
  const t = useTranslations("Pages.missionVision");
  const reduced = useReducedMotion();

  const principles = [
    { title: t("principle1Title"), desc: t("principle1Desc") },
    { title: t("principle2Title"), desc: t("principle2Desc") },
    { title: t("principle3Title"), desc: t("principle3Desc") },
  ];

  return (
    <>
      {/* ── Mission ────────────────────────────────────────────── */}
      <section className="bg-zinc-200 py-20 dark:bg-zinc-800 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-20 items-start">
            <motion.div {...fade(0, reduced)}>
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {t("missionHeading")}
              </p>
              <h2 className="text-balance text-2xl font-bold leading-snug md:text-3xl lg:text-4xl">
                {t("missionStatement")}
              </h2>
            </motion.div>
            <motion.p
              className="text-base leading-relaxed text-muted-foreground lg:pt-16"
              {...fade(0.15, reduced)}
            >
              {t("missionBody")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Vision ─────────────────────────────────────────────── */}
      <section className="bg-zinc-800 dark:bg-zinc-200  py-20 text-background lg:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-20 items-start">
            <motion.div {...fade(0, reduced)}>
              <p className="text-sm font-semibold uppercase tracking-widest text-background/50 mb-3">
                {t("visionHeading")}
              </p>
              <h2 className="text-balance text-2xl font-bold leading-snug md:text-3xl lg:text-4xl">
                {t("visionStatement")}
              </h2>
            </motion.div>
            <motion.p
              className="text-base leading-relaxed text-background/65 lg:pt-16"
              {...fade(0.15, reduced)}
            >
              {t("visionBody")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Principles ─────────────────────────────────────────── */}
      <section className="bg-zinc-200 py-20 dark:bg-zinc-800 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.h2
            className="mb-10 text-2xl font-bold md:text-3xl"
            {...fade(0, reduced)}
          >
            {t("principlesHeading")}
          </motion.h2>

          <div className="flex flex-col divide-y divide-border">
            {principles.map((principle, i) => (
              <motion.div
                key={i}
                className="grid gap-4 py-4 sm:py-8 sm:grid-cols-[2fr_3fr] sm:gap-12"
                {...fade(i * 0.08, reduced)}
              >
                <h3 className="text-xl font-bold leading-snug md:text-2xl">
                  {principle.title}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {principle.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
