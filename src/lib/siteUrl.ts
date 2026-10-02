// Canonical site URL used for metadata (canonical links, OG/JSON-LD, sitemap).
// NEXT_PUBLIC_SITE_URL (set in Vercel) wins; the fallback is the club's domain.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.oba-nazareth.org";
