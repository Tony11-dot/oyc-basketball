import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...["privacy", "terms", "cookies", "accessibility"].map((page) => ({
      url: `${SITE_URL}/${page}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
