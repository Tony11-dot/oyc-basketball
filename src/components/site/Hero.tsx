"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { SiteContent } from "@/lib/types";
import { STYLE_KEYS, styleToCss } from "@/lib/textStyle";

// Full-bleed immersive hero: the photo (or brand gradient) fills the section,
// a navy scrim keeps text readable, and the crest + headline + CTAs sit centred
// on top. A deliberate departure from the old two-column template layout.
export function Hero({
  hero,
  styles,
  bg,
}: {
  hero: SiteContent["hero"];
  styles?: SiteContent["styles"];
  bg?: string;
}) {
  const { t, pick } = useI18n();
  const titleStyle = styleToCss(styles?.[STYLE_KEYS.heroTitle]);
  const subtitleStyle = styleToCss(styles?.[STYLE_KEYS.heroSubtitle]);
  const bodyStyle = styleToCss(styles?.[STYLE_KEYS.heroBody]);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // The hero photo is the star; fall back to the admin section bg, then to the
  // animated brand gradient so the section always looks intentional.
  const backdrop = hero.image || bg;

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-20 text-center md:pt-32"
    >
      {/* backdrop layer (parallax) */}
      <motion.div style={{ y: backdropY }} className="pointer-events-none absolute inset-0 -z-20">
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdrop}
            alt=""
            style={hero.imagePosition ? { objectPosition: hero.imagePosition } : undefined}
            className="h-full w-full scale-110 object-cover"
          />
        ) : (
          <div className="brand-gradient-animated h-full w-full" />
        )}
      </motion.div>

      {/* navy scrim — keeps white text legible over any photo */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-darker/85 via-brand-dark/75 to-brand-darker/90" />
      {/* red + blue ambient glows, echoing the crest */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 start-[-10%] size-[34rem] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-24 end-[-10%] size-[34rem] rounded-full bg-brand-light/25 blur-3xl" />
      </div>

      <motion.div style={{ y: contentY, opacity: fade }} className="container-x flex flex-col items-center">
        {/* crest */}
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          src="/logo.png"
          alt="OYC Nazareth"
          className="h-40 w-auto rounded-2xl bg-white/95 p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:h-52"
        />

        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur"
        >
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          {t.hero.badge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          style={titleStyle}
          className="mt-5 max-w-4xl whitespace-pre-line text-4xl font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-sm md:text-6xl lg:text-7xl"
        >
          {pick(hero.title)}
        </motion.h1>

        {/* red accent rule — a nod to the crest banner */}
        <motion.span
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-6 block h-1.5 w-24 rounded-full bg-accent"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={subtitleStyle}
          className="mt-5 whitespace-pre-line text-lg font-semibold text-white/90 md:text-xl"
        >
          {pick(hero.subtitle)}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          style={bodyStyle}
          className="mt-4 max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/75 md:text-lg"
        >
          {pick(hero.body)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#register"
            className="inline-flex h-13 items-center justify-center rounded-xl bg-accent px-8 text-base font-semibold text-white shadow-[0_12px_34px_rgba(198,38,49,0.45)] transition hover:-translate-y-0.5 hover:bg-accent-dark"
          >
            {t.hero.cta}
          </a>
          <a
            href="#teams"
            className="inline-flex h-13 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            {t.hero.secondary}
          </a>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.a
        href="#teams"
        aria-label={t.hero.secondary}
        style={{ opacity: fade }}
        className="absolute bottom-6 start-1/2 -translate-x-1/2 text-white/70 transition hover:text-white"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.a>
    </section>
  );
}
