import { CATEGORIES } from "@repo/types";
import { SITE } from "@/lib/site";
import { getAllPublished } from "@/lib/api";

export const revalidate = 3600;

/**
 * /llms.txt — a plain-text index of the site for LLMs / answer engines (GEO).
 * https://llmstxt.org
 */
export async function GET() {
  const posts = await getAllPublished();

  const lines = [`# ${SITE.name}`, "", `> ${SITE.description}`, ""];

  for (const category of CATEGORIES) {
    const items = posts.filter((post) => post.categorySlug === category.slug);
    if (items.length === 0) continue;
    lines.push(`## ${category.name}`);
    for (const post of items) {
      lines.push(`- [${post.title}](${SITE.url}/blog/${post.slug}): ${post.excerpt}`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
