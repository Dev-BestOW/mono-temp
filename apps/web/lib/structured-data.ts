import { getCategory, type Content, type FaqItem } from "@repo/types";
import { SITE } from "./site";

const organization = {
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: { "@type": "ImageObject", url: `${SITE.url}/icon` },
  ...(SITE.sameAs.length > 0 ? { sameAs: SITE.sameAs } : {}),
};

/** WebSite + publisher — emit once (home). */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "ko-KR",
    publisher: organization,
  };
}

export function organizationJsonLd() {
  return { "@context": "https://schema.org", ...organization };
}

/** Article schema for a blog post (rich result eligible). */
export function blogPostingJsonLd(content: Content) {
  const url = `${SITE.url}/blog/${content.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: content.title,
    description: content.summary ?? content.excerpt,
    ...(content.coverImageUrl ? { image: [content.coverImageUrl] } : {}),
    inLanguage: "ko-KR",
    articleSection: getCategory(content.categorySlug)?.name,
    datePublished: content.publishedAt ?? undefined,
    dateModified: content.updatedAt,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: organization,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

/** ItemList for a category listing — structured signal for the list page (SEO/AEO). */
export function itemListJsonLd(items: { title: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE.url}/blog/${item.slug}`,
      name: item.title,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** FAQPage schema — strong AEO / featured-snippet signal. */
export function faqJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
