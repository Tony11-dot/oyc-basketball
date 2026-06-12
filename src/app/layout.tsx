import type { Metadata } from "next";
import { Rubik, Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { ToastProvider } from "@/components/ui/Toast";

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

export const metadata: Metadata = {
  title: "OYC Nazareth Basketball",
  description:
    "Orthodox Youth Club Nazareth basketball — our teams, highlights, gallery and registration.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // lang/dir start at Arabic (default) and are updated client-side by the
  // LanguageProvider; suppressHydrationWarning avoids a mismatch warning.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${rubik.variable} ${cairo.variable}`}>
      <body>
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
