import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderContentToHTML, type PartialBlock } from "@repo/editor";
import "@repo/editor/content.css";
import { api, hasBackend } from "@/lib/api";

// Incremental Static Regeneration: rebuild a page at most once per interval.
// On publish, call on-demand revalidation from the backend for instant updates.
export const revalidate = 60;

type PageParams = { params: Promise<{ slug: string }> };

async function getContent(slug: string) {
  if (!hasBackend) return null;
  try {
    return await api.getBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  if (!hasBackend) return [];
  try {
    const list = await api.listPublished();
    return list.map((content) => ({ slug: content.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent(slug);
  if (!content) return {};

  const title = content.seoTitle ?? content.title;
  const description = content.seoDescription ?? content.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${content.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: content.publishedAt ?? undefined,
      modifiedTime: content.updatedAt,
      images: content.coverImageUrl ? [content.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params;
  const content = await getContent(slug);
  if (!content || content.status !== "published") notFound();

  // Server-render the BlockNote document to HTML (indexable for SEO).
  const html = await renderContentToHTML(content.body as PartialBlock[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.excerpt,
    image: content.coverImageUrl ?? undefined,
    datePublished: content.publishedAt ?? undefined,
    dateModified: content.updatedAt,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1 className="text-4xl font-bold tracking-tight">{content.title}</h1>
        {content.publishedAt ? (
          <time className="mt-2 block text-sm text-muted-foreground" dateTime={content.publishedAt}>
            {new Date(content.publishedAt).toLocaleDateString("ko-KR")}
          </time>
        ) : null}
        <div
          className="content-body mt-8"
          // Content is authored in the trusted admin; sanitize here if you ever
          // open authoring to untrusted users.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
