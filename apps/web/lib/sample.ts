import { CATEGORIES, type Content, type ContentSummary } from "@repo/types";

/**
 * Placeholder content used ONLY when no backend is configured, so the
 * benchmarked layout is visible during local development. Real data comes
 * from the backend via `@repo/api` once `BACKEND_URL` is set.
 */
export const sampleContent: ContentSummary[] = CATEGORIES.flatMap((category) =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `${category.slug}-${i}`,
    slug: `${category.slug}-sample-${i + 1}`,
    categorySlug: category.slug,
    title: `${category.name} 콘텐츠 예시 ${i + 1} — 알아두면 좋은 핵심 정리`,
    excerpt: `${category.name} 카테고리의 미리보기 글입니다. 백엔드 연결 전 레이아웃 확인용 더미 데이터예요.`,
    coverImageUrl: null,
    seoTitle: null,
    seoDescription: null,
    status: "published" as const,
    publishedAt: `2026-06-${String(10 + i).padStart(2, "0")}`,
    updatedAt: `2026-06-${String(10 + i).padStart(2, "0")}`,
  })),
);

/** A sample BlockNote body so detail pages are previewable without a backend. */
const sampleBody: unknown[] = [
  { type: "heading", props: { level: 2 }, content: "개요" },
  {
    type: "paragraph",
    content:
      "백엔드 연결 전 레이아웃을 확인하기 위한 샘플 본문입니다. 실제 콘텐츠는 어드민 에디터로 작성해 백엔드에 저장됩니다.",
  },
  {
    type: "paragraph",
    content:
      "본문에는 제목, 단락, 목록, 콜아웃, 표, 임베드 등 다양한 블록을 사용할 수 있습니다.",
  },
  {
    type: "callout",
    props: { type: "info" },
    content: "BACKEND_URL을 설정하면 이 샘플 대신 실제 콘텐츠가 표시됩니다.",
  },
];

/** Pre-rendered HTML matching the sample body (same classes as content.css). */
const sampleBodyHtml = [
  "<h2>개요</h2>",
  "<p>백엔드 연결 전 레이아웃을 확인하기 위한 샘플 본문입니다. 실제 콘텐츠는 어드민 에디터로 작성해 백엔드에 저장됩니다.</p>",
  "<p>본문에는 제목, 단락, 목록, 인용, 콜아웃, 표, 임베드 등 다양한 블록을 사용할 수 있습니다.</p>",
  "<h3>주요 항목</h3>",
  "<ul><li>첫 번째 항목</li><li>두 번째 항목</li><li>세 번째 항목</li></ul>",
  "<ol><li>순서 있는 항목 1</li><li>순서 있는 항목 2</li></ol>",
  "<blockquote>인용문은 이렇게 표시됩니다.</blockquote>",
  '<aside class="callout" data-callout-type="info"><span class="callout-emoji">💡</span><div class="callout-content">BACKEND_URL을 설정하면 이 샘플 대신 실제 콘텐츠가 표시됩니다.</div></aside>',
  '<aside class="callout" data-callout-type="warning"><span class="callout-emoji">⚠️</span><div class="callout-content">주의가 필요한 내용은 이렇게 강조합니다.</div></aside>',
  "<table><tbody><tr><td>항목</td><td>설명</td></tr><tr><td>저축</td><td>안전한 자산 관리</td></tr></tbody></table>",
].join("");

/** Build a full sample Content (with body + bodyHtml) for a given slug, or null. */
export function sampleContentBySlug(slug: string): Content | null {
  const summary = sampleContent.find((item) => item.slug === slug);
  if (!summary) return null;
  return { ...summary, body: sampleBody, bodyHtml: sampleBodyHtml };
}
