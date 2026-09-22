import type { Metadata } from "next";
import { Rubik, Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { SITE_URL } from "@/lib/siteUrl";

// Rubik covers Latin + Hebrew (used for he/en); Cairo covers Arabic. The body
// font stacks Rubik then Cairo, and globals.css makes Arabic (html[lang=ar])
// prefer Cairo — so every language renders in a proper, matching typeface.
const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const TITLE = "نادي الروم الأرثوذكسي لكرة السلة – الناصرة";
const DESCRIPTION =
  "نادي الروم لكرة السلة في الناصرة (النادي الأرثوذكسي لكرة السلة) — تعرّفوا على فرقنا ولاعبينا ومبارياتنا، وسجّلوا أطفالكم الآن.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "نادي الروم لكرة السلة",
    "النادي الأرثوذكسي لكرة السلة",
    "نادي الروم الأرثوذكسي",
    "كرة السلة الناصرة",
    "الروم الأرثوذكس الناصرة",
    "Orthodox Basketball Association",
    "OBA Nazareth",
    "כדורסל נצרת",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "نادي الروم الأرثوذكسي لكرة السلة",
    images: ["/logo.png"],
    locale: "ar_IL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

// Sitewide identity for search engines — lists the club's common Arabic name
// variants (official + colloquial "نادي الروم") as alternateName so a search
// for either one can resolve to this org.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "النادي الأرثوذكسي لكرة السلة",
  alternateName: [
    "نادي الروم لكرة السلة",
    "نادي الروم الأرثوذكسي لكرة السلة",
    "Orthodox Basketball Association",
    "OBA Nazareth",
  ],
  sport: "Basketball",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "الناصرة",
    addressCountry: "IL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // lang/dir start at Arabic (default) and are updated client-side by the
  // LanguageProvider; suppressHydrationWarning avoids a mismatch warning.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${rubik.variable} ${cairo.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body>
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
