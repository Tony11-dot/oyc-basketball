"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { GalleryImage, SiteContent } from "@/lib/types";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { downloadFile } from "@/lib/download";
import { styleToCss } from "@/lib/textStyle";
import { Marquee } from "./Marquee";
import { SectionHeading } from "./SectionHeading";
import { SectionBg } from "./SectionBg";

function Photo({ g, styles }: { g: GalleryImage; styles?: SiteContent["styles"] }) {
  const { pick, locale } = useI18n();
  const caption = pick(g.caption);
  const downloadLabel = locale === "ar" ? "تنزيل" : locale === "he" ? "הורדה" : "Download";

  return (
    <div className="relative w-[300px] shrink-0 sm:w-[360px]">
      <div className="relative overflow-hidden rounded-3xl shadow-card" style={{ aspectRatio: g.aspectRatio ?? "4 / 3" }}>
        <ImageBlock src={g.image} alt={caption || "OYC Nazareth"} rounded="rounded-3xl" objectPosition={g.imagePosition} />

        <button
          type="button"
          onClick={() => downloadFile(g.image, `${caption || "photo"}.jpg`)}
          aria-label={downloadLabel}
          title={downloadLabel}
          className="absolute end-2 top-2 grid size-9 place-items-center rounded-full bg-white/85 text-lg text-brand-dark shadow-lg backdrop-blur transition hover:bg-white active:scale-95"
        >
          ↓
        </button>

        {caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5">
            <p className="text-base font-bold text-white drop-shadow md:text-lg" style={styleToCss(styles?.[`gallery.${g.id}.caption`])}>{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Auto-running photo "train", fully managed in the admin. Hover to pause and
// download any shot.
export function Gallery({ gallery, bg, styles }: { gallery: GalleryImage[]; bg?: string; styles?: SiteContent["styles"] }) {
  const { t } = useI18n();
  if (gallery.length === 0) return null;

  return (
    <section id="gallery" className={`relative scroll-mt-20 overflow-hidden bg-surface py-20 md:py-28 ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}>
      <SectionBg url={bg} />
      <div className="container-x">
        <SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.heading} subtitle={t.gallery.subheading} />
      </div>

      <div className="mt-10">
        <Marquee pxPerSecond={44} reverse className="py-1">
          {gallery.map((g) => (
            <Photo key={g.id} g={g} styles={styles} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
