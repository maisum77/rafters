import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { WORK } from "@/data/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.8 },
    { path: "/work", priority: 0.8 },
    { path: "/process", priority: 0.7 },
    { path: "/craft", priority: 0.7 },
    { path: "/contact", priority: 0.6 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE.url}${r.path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...WORK.map((w) => ({
      url: `${SITE.url}/work/${w.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
