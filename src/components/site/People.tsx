"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Person } from "@/lib/types";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { SectionHeading } from "./SectionHeading";
import { SectionBg } from "./SectionBg";

// Shared people grid used by both the Staff and Volunteers sections. `kind`
// selects the section id, nav target and localized labels; `tinted` alternates
// the background so adjacent people sections stay visually distinct.
export function People({
  kind,
  people,
  bg,
  tinted,
}: {
  kind: "staff" | "volunteers";
  people: Person[];
  bg?: string;
  tinted?: boolean;
}) {
  const { t, pick } = useI18n();
  const d = t[kind];

  return (
    <section
      id={kind}
      className={`relative scroll-mt-20 overflow-hidden py-20 md:py-28 ${tinted ? "bg-surface" : ""} ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}
    >
      <SectionBg url={bg} />
      <div className="container-x">
        <SectionHeading eyebrow={d.eyebrow} title={d.heading} subtitle={d.subheading} />

        {people.length === 0 ? (
          <p className="mt-12 text-center text-muted">{d.empty}</p>
        ) : (
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {people.map((person, i) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.08 }}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card"
              >
                <div className="overflow-hidden" style={{ aspectRatio: person.aspectRatio ?? "4 / 5" }}>
                  <ImageBlock src={person.image} alt={pick(person.name)} icon="user" rounded="rounded-none" objectPosition={person.imagePosition} />
                </div>
                <div className="p-3 text-center">
                  <p className="truncate text-sm font-bold text-ink">{pick(person.name)}</p>
                  {pick(person.role) && <p className="truncate text-xs font-semibold text-brand-dark">{pick(person.role)}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
