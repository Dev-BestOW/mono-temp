import type { MetadataRoute } from "next";
import { CATEGORIES } from "@repo/types";
import { SITE } from "@/lib/site";
import { getAllPublished } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublished();

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
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...categoryEntries,
    ...postEntries,
  ];
}
