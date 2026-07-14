import type { Metadata } from "next";

// Admin browser-tab title + favicon (the crest logo), distinct from the public
// site's "OBA Basketball".
export const metadata: Metadata = {
  title: "OBA Basketball Admin",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

// Admin follows the selected site language/direction (Hebrew + RTL by default),
// set on <html> by the LanguageProvider — same as the public site.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface text-ink">{children}</div>;
}
