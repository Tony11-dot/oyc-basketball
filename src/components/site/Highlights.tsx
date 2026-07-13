"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Highlight } from "@/lib/types";
import { downloadFile } from "@/lib/download";
import { Marquee } from "./Marquee";
import { SectionHeading } from "./SectionHeading";
import { SectionBg } from "./SectionBg";

// Turn a YouTube / Instagram share link into an embeddable URL. Unknown links
// are returned as-is (rendered in an iframe).
function toEmbed(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    // YouTube
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    // Instagram — append /embed to the post/reel permalink
    if (host.endsWith("instagram.com")) {
      const clean = url.split("?")[0].replace(/\/$/, "");
      return `${clean}/embed`;
    }
    return url;
  } catch {
    return url;
  }
}

function Reel({ h }: { h: Highlight }) {
  const { pick, locale } = useI18n();
  const ratio = h.aspectRatio ?? "9 / 16";
  const caption = pick(h.caption);
  const downloadLabel = locale === "ar" ? "تنزيل" : locale === "he" ? "הורדה" : "Download";
  const openLabel = locale === "ar" ? "فتح" : locale === "he" ? "פתח" : "Open";

  return (
    <div className="relative w-[220px] shrink-0 sm:w-[248px]">
      <div className="relative overflow-hidden rounded-3xl bg-black shadow-card" style={{ aspectRatio: ratio }}>
        {h.videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={h.videoUrl}
            poster={h.poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : h.embedUrl ? (
          <iframe
            src={toEmbed(h.embedUrl)}
            title={caption || "highlight"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl text-white/30">🏀</div>
        )}

        {/* Download (uploaded video) or open (external embed). */}
        {h.videoUrl ? (
          <button
            type="button"
            onClick={() => downloadFile(h.videoUrl!, `${caption || "reel"}.mp4`)}
            aria-label={downloadLabel}
            title={downloadLabel}
            className="absolute end-2 top-2 grid size-9 place-items-center rounded-full bg-white/85 text-lg text-brand-dark shadow-lg backdrop-blur transition hover:bg-white active:scale-95"
          >
            ↓
          </button>
        ) : h.embedUrl ? (
          <a
            href={h.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={openLabel}
            title={openLabel}
            className="absolute end-2 top-2 grid size-9 place-items-center rounded-full bg-white/85 text-base text-brand-dark shadow-lg backdrop-blur transition hover:bg-white active:scale-95"
          >
            ↗
          </a>
        ) : null}

        {caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-sm font-bold text-white drop-shadow md:text-base">{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Horizontal, always-running reel "train". Hover to pause and grab a reel.
export function Highlights({ highlights, bg }: { highlights: Highlight[]; bg?: string }) {
  const { t } = useI18n();

  return (
    <section id="highlights" className={`relative scroll-mt-20 overflow-hidden bg-surface py-20 md:py-28 ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}>
      <SectionBg url={bg} />
      <div className="container-x">
        <SectionHeading eyebrow={t.highlights.eyebrow} title={t.highlights.heading} subtitle={t.highlights.subheading} />
      </div>

      {highlights.length === 0 ? (
        <p className="mt-12 text-center text-muted">{t.highlights.empty}</p>
      ) : (
        <div className="mt-10">
          <Marquee pxPerSecond={38} className="py-1">
            {highlights.map((h) => (
              <Reel key={h.id} h={h} />
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}
