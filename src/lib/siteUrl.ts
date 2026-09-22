// Canonical site URL used for metadata (canonical links, OG/JSON-LD, sitemap).
// Set NEXT_PUBLIC_SITE_URL in Vercel once the custom domain is live; until then
// this falls back to the current production URL so metadata still resolves.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oyc-basketball-alpha.vercel.app";
