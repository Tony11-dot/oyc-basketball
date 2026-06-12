"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { SiteContent } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";
import { styleToCss } from "@/lib/textStyle";
import { SocialIcon, socialHref } from "./SocialIcon";

export function Footer({ footer, styles }: { footer: SiteContent["footer"]; styles?: SiteContent["styles"] }) {
  const { t, pick } = useI18n();
  const hasContact = !!(footer.phone || footer.email);

  return (
    <footer id="contact" className="scroll-mt-20 brand-gradient text-white">
      <div className="container-x py-8">
        {/* Single full-width row — spreads edge to edge so there's no empty
            column when contact details aren't set. */}
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-start">
          {/* brand + address */}
          <div className="flex items-center gap-4">
            <span className="inline-flex shrink-0 rounded-2xl bg-white p-2 shadow-soft">
              <Logo className="h-14 w-auto" />
            </span>
            {pick(footer.address) && (
              <p
                className="max-w-xs whitespace-pre-line text-sm text-white/80"
                style={styleToCss(styles?.["footer.address"])}
              >
                📍 {pick(footer.address)}
              </p>
            )}
          </div>

          {hasContact && (
            <div className="md:text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">{t.footer.contact}</h3>
              <ul className="mt-1.5 space-y-1 text-sm">
                {footer.phone && (
                  <li>
                    <a href={`tel:${footer.phone.replace(/\s/g, "")}`} className="text-white/90 transition hover:text-white" dir="ltr">
                      {footer.phone}
                    </a>
                  </li>
                )}
                {footer.email && (
                  <li>
                    <a href={`mailto:${footer.email}`} className="text-white/90 transition hover:text-white">
                      {footer.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* follow */}
          <div className="flex flex-col items-center gap-2.5 md:items-end">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">{t.footer.follow}</h3>
            <ul className="flex flex-wrap justify-center gap-2.5">
              {footer.social.map((s) => {
                const href = socialHref(s.label, s.url);
                if (!href) return null;
                return (
                  <li key={s.label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                    >
                      <SocialIcon label={s.label} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-white/15 pt-4 text-center text-sm text-white/70">
          <p>© {new Date().getFullYear()} OYC Nazareth. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
