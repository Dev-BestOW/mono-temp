import type { Content } from "@repo/types";

/**
 * Sample full content used ONLY when no backend is reachable, so the SEO
 * dashboard renders with realistic, varied diagnostics during local dev.
 * Real data comes from `@repo/api` once the backend is connected.
 */

const longBody = [
  "<h2>핵심 요약</h2>",
  "<p>저축은 단순히 돈을 모으는 행위가 아니라, 목표와 기간에 맞춰 적절한 상품을 고르는 전략입니다. 단기 자금은 입출금이 자유로운 파킹통장에, 1~3년 목표 자금은 적금에, 그 이상은 투자와 병행하는 것이 일반적입니다.</p>",
  "<h3>왜 중요한가요?</h3>",
  "<p>금리 환경에 따라 같은 금액을 모아도 결과가 달라집니다. 우대금리 조건을 충족하면 표면 금리보다 높은 실질 수익을 얻을 수 있고, 비과세·세금우대 한도를 활용하면 세후 수익률을 끌어올릴 수 있습니다.</p>",
  "<ul><li>목표 기간을 먼저 정한다</li><li>우대금리 조건을 확인한다</li><li>비과세 한도를 활용한다</li></ul>",
  "<p>마지막으로, 자동이체를 설정해 강제 저축 구조를 만드는 것이 장기적으로 가장 효과가 큽니다. 매달 일정 금액이 빠져나가도록 해두면 소비를 통제하기 쉽고 목표 달성 확률이 올라갑니다.</p>",
].join("");

const shortBody = "<h2>개요</h2><p>간단히 정리한 글입니다.</p>";

function article(
  p: Partial<Content> &
    Pick<Content, "id" | "slug" | "categorySlug" | "title">,
): Content {
  return {
    body: [],
    bodyHtml: longBody,
    excerpt:
      "이 글의 핵심을 짧게 요약한 미리보기 문장입니다. 메타 설명으로도 쓰입니다.",
    coverImageUrl: "https://picsum.photos/seed/cover/1600/900",
    seoTitle: null,
    seoDescription:
      "검색 결과에 노출되는 메타 설명입니다. 핵심 키워드를 담아 120자에서 155자 사이로 작성하면 클릭을 유도하기에 가장 좋은 길이가 됩니다. 적절한 길이를 지킵니다.",
    summary: "이 주제에서 꼭 알아야 할 핵심을 한 문장으로 먼저 정리했습니다.",
    faqs: [
      { question: "꼭 알아야 할 점은?", answer: "핵심부터 확인하세요." },
      { question: "주의할 점은?", answer: "조건을 반드시 확인하세요." },
      { question: "다음 단계는?", answer: "관련 글을 이어서 읽어보세요." },
    ],
    status: "published",
    publishedAt: "2026-05-20",
    updatedAt: "2026-05-20",
    ...p,
  };
}

export const sampleContents: Content[] = [
  // 완성도 높은 글 (높은 점수)
  article({
    id: "s1",
    slug: "savings-strategy-guide",
    categorySlug: "savings",
    title: "저축 전략 완벽 가이드 — 목표별 상품 고르는 법",
  }),
  // AEO 누락 + thin content (요약·FAQ 없음, 본문 짧음)
  article({
    id: "s2",
    slug: "savings-quick-tip",
    categorySlug: "savings",
    title: "파킹통장 200% 활용법",
    bodyHtml: shortBody,
    summary: null,
    faqs: [],
    coverImageUrl: null,
    seoDescription: "짧은 설명.",
    updatedAt: "2026-06-01",
  }),
  // FAQ 부족(<3) + 커버 없음 + 설명 짧음
  article({
    id: "i1",
    slug: "invest-etf-basics",
    categorySlug: "invest",
    title: "ETF 투자 기초 — 처음 시작하는 분들을 위한 안내",
    faqs: [{ question: "ETF란?", answer: "상장지수펀드입니다." }],
    coverImageUrl: null,
    seoDescription: "ETF 기초 설명.",
  }),
  // 이미지 alt 누락 + 헤딩 구조 오류(H1 중복)
  article({
    id: "l1",
    slug: "life-budgeting",
    categorySlug: "life",
    title: "신혼부부 가계부 작성법",
    bodyHtml:
      "<h1>가계부</h1><p>매달 고정지출을 먼저 파악합니다.</p><h1>저축 비중</h1><p>수입의 일정 비율을 먼저 떼어둡니다. 남는 돈을 저축하는 것이 아니라 저축하고 남는 돈을 쓰는 구조를 만들어야 장기적으로 자산이 쌓입니다.</p><img src='https://picsum.photos/seed/x/800/400'>",
    summary: null,
  }),
  // 신선도 위험 (오래 미수정)
  article({
    id: "ln1",
    slug: "loan-credit-score",
    categorySlug: "loan",
    title: "신용점수 올리는 현실적인 방법",
    updatedAt: "2025-08-01",
    publishedAt: "2025-07-15",
  }),
  // 초안 (발행 통계에서 제외)
  article({
    id: "t1",
    slug: "tax-year-end",
    categorySlug: "tax",
    title: "연말정산 미리 준비하기",
    status: "draft",
  }),
  // 중복 제목 (카니발라이제이션) A
  article({
    id: "p1",
    slug: "pension-tax-credit",
    categorySlug: "pension",
    title: "연금저축 세액공제 한도 총정리",
  }),
  // 중복 제목 B (같은 제목, 다른 slug)
  article({
    id: "p2",
    slug: "pension-tax-credit-2026",
    categorySlug: "pension",
    title: "연금저축 세액공제 한도 총정리",
    updatedAt: "2026-06-10",
  }),
];
