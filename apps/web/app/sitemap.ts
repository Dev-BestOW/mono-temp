import type { MetadataRoute } from "next";
import { CATEGORIES } from "@repo/types";
import { SITE } from "@/lib/site";
import { getAllPublished } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublished();

  // Most-recent content update — a stable freshness signal for the home entry
  // (avoid `new Date()`, which churns on every request and misleads crawlers).
  const latestUpdate = posts.reduce<string | undefined>(
    (max, post) => (!max || post.updatedAt > max ? post.updatedAt : max),
    undefined,
  );

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE.url}/category/${category.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: SITE.url,
      ...(latestUpdate ? { lastModified: new Date(latestUpdate) } : {}),
      changeFrequency: "daily",
      priority: 1,
    },
    ...categoryEntries,
    ...postEntries,
  ];
}
