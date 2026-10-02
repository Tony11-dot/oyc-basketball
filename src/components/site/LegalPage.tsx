"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

const BACK: Localized = { ar: "العودة إلى الموقع", he: "חזרה לאתר", en: "Back to the site" };

const LEGAL_LINKS = ["privacy", "terms", "cookies", "accessibility"] as const;

// Turn e-mail addresses inside a paragraph into mailto links.
function withEmailLinks(text: string): React.ReactNode[] {
  return text.split(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={`mailto:${part}`} dir="ltr" className="font-semibold text-brand-dark underline underline-offset-2">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export interface LegalSection {
  heading: Localized;
  body: Localized[];
}

/** Shared chrome for static legal pages (privacy/cookies/terms/accessibility) — a minimal
 * header, the localized sections, and a way back to the site. */
export function LegalPage({ title, sections }: { title: Localized; sections: LegalSection[] }) {
  const { pick, t } = useI18n();

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-10 w-auto" />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container-x max-w-3xl py-12 md:py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:underline">
          {/* "←" mirrors to "→" in Arabic/Hebrew. */}
          <span aria-hidden className="flip-x inline-block">←</span>
          {pick(BACK)}
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-ink md:text-4xl">{pick(title)}</h1>

        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-brand-dark">{pick(s.heading)}</h2>
              <div className="mt-2 space-y-3 text-sm leading-7 text-muted md:text-base">
                {s.body.map((p, j) => (
                  <p key={j}>{withEmailLinks(pick(p))}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="container-x flex max-w-3xl flex-col items-center gap-3 py-6 text-center text-xs text-muted">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {LEGAL_LINKS.map((k) => (
              <Link key={k} href={`/${k}`} className="font-semibold transition hover:text-brand-dark">
                {t.footer[k]}
              </Link>
            ))}
          </nav>
          <p>© {new Date().getFullYear()} {t.footer.club}. {t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}
