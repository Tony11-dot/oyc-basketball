import type { Metadata } from "next";
import { Rubik, Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AccessibilityWidget } from "@/components/ui/AccessibilityWidget";
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

const TITLE = "النادي الأرثوذكسي لكرة السلة – الناصرة";
const DESCRIPTION =
  "النادي الأرثوذكسي لكرة السلة في الناصرة — تعرّفوا على فرقنا ولاعبينا ومبارياتنا، وسجّلوا أطفالكم الآن.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // Keywords (and the JSON-LD alternateName below) are invisible to visitors —
  // they carry the colloquial "نادي الروم" and common misspellings so a search
  // for any of them still finds the club, without showing them on the page.
  keywords: [
    "النادي الأرثوذكسي لكرة السلة",
    "النادي الاورثوذكسي لكرة السلة",
    "النادي الارثوذكسي لكرة السلة",
    "نادي الروم لكرة السلة",
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
    siteName: "النادي الأرثوذكسي لكرة السلة",
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
    "النادي الاورثوذكسي لكرة السلة",
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

// Re-applies saved accessibility preferences before first paint, so returning
// visitors never see a flash back to default contrast/text size on load.
const A11Y_INIT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem("oyc.a11y")||"{}");var c=document.documentElement.classList;var steps=[100,110,120,130];if(p.fontStep)document.documentElement.style.fontSize=(steps[p.fontStep]||100)+"%";if(p.contrast)c.add("a11y-contrast");if(p.grayscale)c.add("a11y-grayscale");if(p.underline)c.add("a11y-underline");if(p.reduceMotion)c.add("a11y-reduce-motion");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // lang/dir start at Arabic (default) and are updated client-side by the
  // LanguageProvider; suppressHydrationWarning avoids a mismatch warning.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${rubik.variable} ${cairo.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT_SCRIPT }} />
      </head>
      <body>
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
          <AccessibilityWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
