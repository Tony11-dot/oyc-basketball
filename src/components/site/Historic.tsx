"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { HistoricSection, SiteContent } from "@/lib/types";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { styleToCss } from "@/lib/textStyle";
import { Reveal } from "./Reveal";
import { SectionBg } from "./SectionBg";

// "Historic Glance" — an editable narrative (title + body) with an optional photo.
export function Historic({ historic, bg, styles }: { historic: HistoricSection; bg?: string; styles?: SiteContent["styles"] }) {
  const { t, pick } = useI18n();
  const title = pick(historic.title);
  const body = pick(historic.body);

  return (
    <section id="historic" className={`relative scroll-mt-20 overflow-hidden py-20 md:py-28 ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}>
      <SectionBg url={bg} />
      <div className="container-x">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div className={historic.image ? "" : "mx-auto max-w-2xl text-center md:col-span-2"}>
            <Reveal>
              <span className="inline-block rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                {t.historic.eyebrow}
              </span>
            </Reveal>
            {title && (
              <Reveal index={1}>
                <h2 className="mt-4 whitespace-pre-line text-3xl font-extrabold tracking-tight text-ink md:text-4xl" style={styleToCss(styles?.["historic.title"])}>
                  {title}
                </h2>
              </Reveal>
            )}
            {body && (
              <Reveal index={2}>
                <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted md:text-lg" style={styleToCss(styles?.["historic.body"])}>
                  {body}
                </p>
              </Reveal>
            )}
          </div>

          {historic.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-3xl border border-line shadow-card"
              style={{ aspectRatio: historic.aspectRatio ?? "4 / 3" }}
            >
              <ImageBlock src={historic.image} alt={title} rounded="rounded-none" objectPosition={historic.imagePosition} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
