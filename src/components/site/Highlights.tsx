"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Highlight } from "@/lib/types";
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
  const { pick } = useI18n();
  const ratio = h.aspectRatio ?? "9 / 16";
  return (
    <div className="relative flex-shrink-0 basis-[78%] snap-center sm:basis-[44%] lg:basis-[30%]">
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
            controls
            className="h-full w-full object-cover"
          />
        ) : h.embedUrl ? (
          <iframe
            src={toEmbed(h.embedUrl)}
            title={pick(h.caption) || "highlight"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl text-white/30">🏀</div>
        )}
        {pick(h.caption) && !h.embedUrl && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-sm font-bold text-white drop-shadow md:text-base">{pick(h.caption)}</p>
          </div>
        )}
      </div>
      {pick(h.caption) && h.embedUrl && (
        <p className="mt-2 px-1 text-sm font-semibold text-ink">{pick(h.caption)}</p>
      )}
    </div>
  );
}

// Horizontal, auto-advancing reel "train".
export function Highlights({ highlights, bg }: { highlights: Highlight[]; bg?: string }) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);

  // Cycle the reels "like a train" every 5s when there's more than one.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || highlights.length <= 1) return;
    const id = setInterval(() => {
      const first = el.children[0] as HTMLElement | undefined;
      const step = first ? first.getBoundingClientRect().width + 20 : el.clientWidth;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 5000);
    return () => clearInterval(id);
  }, [highlights.length]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const step = first ? first.getBoundingClientRect().width + 20 : el.clientWidth;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <section id="highlights" className={`relative scroll-mt-20 overflow-hidden bg-surface py-20 md:py-28 ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}>
      <SectionBg url={bg} />
      <div className="container-x">
        <SectionHeading eyebrow={t.highlights.eyebrow} title={t.highlights.heading} subtitle={t.highlights.subheading} />

        {highlights.length === 0 ? (
          <p className="mt-12 text-center text-muted">{t.highlights.empty}</p>
        ) : (
          <div className="relative mt-10">
            <div
              ref={trackRef}
              dir="ltr"
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {highlights.map((h) => (
                <Reel key={h.id} h={h} />
              ))}
            </div>

            {highlights.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scroll(-1)}
                  aria-label="Previous"
                  className="absolute -start-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl text-brand-dark shadow-lg transition hover:bg-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1)}
                  aria-label="Next"
                  className="absolute -end-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl text-brand-dark shadow-lg transition hover:bg-white"
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
