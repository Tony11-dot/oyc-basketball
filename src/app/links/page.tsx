"use client";

import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized } from "@/lib/types";

type LinkItem = { href: string; icon: string; label: Localized; desc?: Localized; external?: boolean };
type Group = { title: Localized; items: LinkItem[] };

const GROUPS: Group[] = [
  {
    title: { ar: "نادينا", he: "המועדון שלנו", en: "Our club" },
    items: [
      {
        href: "/",
        icon: "🏀",
        label: { ar: "الموقع الرسمي", he: "האתר הרשמי", en: "Main site" },
        desc: { ar: "فرقنا، أبرز اللقطات والتسجيل", he: "קבוצות, שיאים והרשמה", en: "Teams, highlights & registration" },
      },
      {
        href: "/admin",
        icon: "⚙️",
        label: { ar: "لوحة الإدارة", he: "ניהול", en: "Admin panel" },
        desc: { ar: "إدارة المحتوى والفرق والحضور", he: "ניהול תוכן, קבוצות ונוכחות", en: "Manage content, teams & attendance" },
      },
      {
        href: "/coach",
        icon: "🧑‍🏫",
        label: { ar: "بوابة المدرّب", he: "פורטל מאמן", en: "Coach portal" },
        desc: { ar: "تسجيل حضور اللاعبين", he: "רישום נוכחות שחקנים", en: "Take player attendance" },
      },
    ],
  },
  {
    title: { ar: "اتحاد كرة السلة (IBBA)", he: "איגוד הכדורסל (IBBA)", en: "Basketball association (IBBA)" },
    items: [
      {
        href: "https://register.ibasketball.co.il/IBBA_forms/Default.aspx",
        icon: "📝",
        external: true,
        label: { ar: "تسجيل الفرق", he: "רישום קבוצות", en: "Team registration" },
      },
      {
        href: "https://voucher.ibasketball.co.il/#!/judge",
        icon: "🎟️",
        external: true,
        label: { ar: "قسائم الحكّام", he: "שוברי שופטים", en: "Judge vouchers" },
      },
      {
        href: "https://ibasketball.co.il/content-type/circulars/",
        icon: "📄",
        external: true,
        label: { ar: "التعاميم", he: "חוזרים", en: "Circulars" },
      },
    ],
  },
];

export default function LinksHub() {
  const { pick } = useI18n();

  return (
    <main className="brand-gradient-animated grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-[0_20px_60px_rgba(8,22,54,0.35)] backdrop-blur sm:p-8">
        <div className="flex items-center justify-between gap-2">
          <Logo className="h-12" />
          <LanguageSwitcher />
        </div>
        <p className="mt-3 text-sm text-muted">
          {pick({ ar: "كل الروابط في مكان واحد.", he: "כל הקישורים במקום אחד.", en: "All the links in one place." })}
        </p>

        <div className="mt-6 space-y-6">
          {GROUPS.map((g) => (
            <div key={g.title.en}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{pick(g.title)}</p>
              <div className="space-y-2">
                {g.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl">{item.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-ink">{pick(item.label)}</span>
                      {item.desc && <span className="block truncate text-xs text-muted">{pick(item.desc)}</span>}
                    </span>
                    <span aria-hidden className="text-muted transition group-hover:text-brand">
                      {item.external ? "↗" : <span className="rtl:rotate-180">›</span>}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted">OYC Nazareth</p>
      </div>
    </main>
  );
}
