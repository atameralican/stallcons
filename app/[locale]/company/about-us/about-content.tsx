"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

export function AboutContent() {
  const t = useTranslations("Pages.aboutUs");
  const reduced = useReducedMotion();


  const values = [
    { title: t("value1Title"), desc: t("value1Desc") },
    { title: t("value2Title"), desc: t("value2Desc") },
    { title: t("value3Title"), desc: t("value3Desc") },
  ];



  return (
    <>
      {/* ── Story ──────────────────────────────────────────────── */}
      <section className="bg-zinc-200 py-16 dark:bg-zinc-800 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div
              className="flex flex-col gap-6"
              {...(reduced
                ? {}
                : {
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.1 },
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                })}
            >
              <h2 className="text-balance text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                {t("storyHeading")}
              </h2>
              <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
                {t("storyBody1")}
              </p>
              <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
                {t("storyBody2")}
              </p>
            </motion.div>

            <motion.div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl shadow-black/10"
              {...(reduced
                ? {}
                : {
                  initial: { opacity: 0, scale: 0.97 },
                  whileInView: { opacity: 1, scale: 1 },
                  viewport: { once: true, amount: 0.1 },
                  transition: {
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.15,
                  },
                })}
            >
              <img
                src="https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?q=80&w=900&auto=format&fit=crop"
                alt={t("storyImageAlt")}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>


      {/* ── Values ─────────────────────────────────────────────── */}
      <section className="bg-zinc-200 py-16 dark:bg-zinc-800 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.h2
            className="mb-6 text-2xl font-bold md:text-3xl"
            {...(reduced
              ? {}
              : {
                initial: { opacity: 0, y: 16 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, amount: 0.2 },
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              })}
          >
            {t("valuesHeading")}
          </motion.h2>

          <div className="flex flex-col divide-y divide-border">
            {values.map((value, i) => (
              <motion.div
                key={i}
                className="grid gap-4 py-4 sm:py-8 sm:grid-cols-[2fr_3fr] sm:gap-12"
                {...(reduced
                  ? {}
                  : {
                    initial: { opacity: 0, y: 16 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.15 },
                    transition: {
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                      delay: i * 0.08,
                    },
                  })}
              >
                <h3 className="text-xl font-bold leading-snug md:text-2xl">
                  {value.title}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </>
  );
}
