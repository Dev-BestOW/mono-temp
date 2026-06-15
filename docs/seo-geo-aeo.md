# 유저 블로그웹 SEO · GEO · AEO 최적화 규칙 (1순위)

> **이 문서는 `apps/web`(유저 블로그웹) 작업 전에 반드시 읽는다.**
>
> **유저 블로그웹의 모든 작업은 SEO/GEO/AEO 최적화가 최우선(1순위)이다.**
> 편의성·구현 단순함·디자인이 검색/답변/생성형 엔진 노출과 충돌하면 **항상 최적화를 우선**한다.
> 새 페이지·기능을 추가할 때 아래 체크리스트를 만족하지 못하면 완료가 아니다.

- SEO = 검색엔진(Google/Bing) 노출
- AEO = 답변 엔진(스니펫·음성·AI 개요)에서 답으로 채택
- GEO = 생성형 엔진(ChatGPT·Perplexity·Gemini 등)에서 인용

---

## 0. 절대 원칙 (MUST / 위반 금지)

1. **콘텐츠는 서버에서 완성된 HTML로 렌더된다.** 본문을 클라이언트에서만 그리지 않는다.
   - 우리 구현: 저장 시 HTML을 pre-render(`Content.bodyHtml`) → 유저웹은 SSG/ISR로 그대로 출력. 자세한 이유는 [`editor-architecture.md`](./editor-architecture.md).
   - 크롤러·LLM은 JS 실행 없이 초기 HTML을 읽는다. 본문이 초기 HTML에 없으면 SEO/GEO 0점.
2. **크롤러를 차단하지 않는다.** `robots`에서 검색 봇과 AI 봇을 막지 않는다(현재 전면 허용).
3. **모든 인덱싱 대상 페이지는 canonical·title·description·OpenGraph를 가진다.**
4. **모든 블로그 글은 구조화 데이터를 가진다**: `BlogPosting` + `BreadcrumbList` (+ FAQ 있으면 `FAQPage`).
5. **새 라우트는 `sitemap.ts`에 포함**되어야 한다.
6. **페이지당 H1은 하나**, 헤딩은 의미 순서(h1→h2→h3)를 지킨다.
7. **slug는 안정적으로 유지**한다. 바꿔야 하면 301 리다이렉트.

---

## 1. SEO 체크리스트 (페이지 추가/수정 시)

- [ ] `generateMetadata`로 `title`·`description`·`alternates.canonical` 설정
- [ ] OpenGraph/Twitter(article이면 `type:"article"` + published/modified/section)
- [ ] 적절한 JSON-LD (글=`BlogPosting`, 목록=`BreadcrumbList`, 홈=`WebSite`/`Organization`)
- [ ] `sitemap.ts`에 URL 포함(글·카테고리 동적 포함)
- [ ] 단일 H1, 시맨틱 마크업, 의미 있는 내부 링크(카테고리·관련 글)
- [ ] 이미지는 `alt` + 치수 지정(가능하면 `next/image`로 LCP 최적화)
- [ ] `lang="ko"`, 모바일 친화(반응형) 유지
- [ ] 깨진 링크·soft 404 없음(없는 콘텐츠는 `notFound()`)

## 2. AEO 체크리스트 (답변 엔진)

- [ ] **답변 우선**: 글 상단에 핵심 요약(`Content.summary`, TL;DR) — 질문에 바로 답
- [ ] **질문형 H2**: "증여세 면제 한도는 얼마인가요?"처럼 사용자가 검색하는 형태
- [ ] **FAQ**: `Content.faqs` 입력 → 화면 FAQ 섹션 + `FAQPage` JSON-LD
- [ ] 단계형 콘텐츠는 `HowTo`, 정의는 자족적인 짧은 단락으로(인용 단위)
- [ ] 표·목록으로 비교/수치를 구조화(스니펫 채택 유리)

## 3. GEO 체크리스트 (생성형 엔진 인용)

- [ ] AI 크롤러 허용 유지(`robots.ts`) — 막으면 인용 불가
- [ ] **`/llms.txt` 갱신** — 새 콘텐츠가 인덱스에 들어가게(현재 자동 생성)
- [ ] **E-E-A-T 신호**: 작성자/발행처(Organization), 근거·출처, 통계엔 출처와 날짜
- [ ] **신선도**: `dateModified`(updatedAt) 유지, 오래된 글은 갱신
- [ ] 엔티티·용어 일관성, 사실을 명확한 문장으로(LLM이 그대로 인용 가능하게)

---

## 4. 콘텐츠 작성 가이드 (에디터로 글 쓸 때)

1. 제목은 검색 의도를 담되 과장 금지.
2. **첫 문단/요약에서 핵심 답을 먼저** 제시(역피라미드).
3. H2를 **질문형**으로, 그 아래에서 바로 답.
4. 한 단락 = 하나의 사실/주장(인용 가능한 단위).
5. 수치·통계엔 **출처와 시점** 명시.
6. 글 하단에 **FAQ 3~5개**(실제 검색 질문 기반).
7. 메타 설명(`excerpt`)은 120~155자, 클릭 유도 + 키워드 포함.

---

## 5. 파일 맵 (어디서 작업하나)

| 목적 | 위치 |
| --- | --- |
| 구조화 데이터 빌더 | `apps/web/lib/structured-data.ts` |
| JSON-LD 주입 컴포넌트 | `apps/web/components/json-ld.tsx` |
| 사이트맵 | `apps/web/app/sitemap.ts` |
| robots(크롤러 정책) | `apps/web/app/robots.ts` |
| llms.txt(GEO) | `apps/web/app/llms.txt/route.ts` |
| 글 상세(메타+JSON-LD+요약+FAQ) | `apps/web/app/blog/[slug]/page.tsx` |
| 카테고리 목록 | `apps/web/app/category/[slug]/page.tsx` |
| 전역 메타·OG 기본값 | `apps/web/app/layout.tsx`, `apps/web/lib/site.ts` |
| 파비콘/로고 | `apps/web/app/icon.tsx` |
| 콘텐츠 모델(summary/faqs 등) | `packages/types/src/index.ts` |
| 본문 HTML pre-render | `@repo/editor`(`blocksToHTML`) → `Content.bodyHtml` |

---

## 6. 하지 말 것 (안티패턴)

- ❌ 본문을 `useEffect`/클라이언트 fetch로만 렌더(초기 HTML에 콘텐츠 없음 → 인덱싱 실패)
- ❌ 유저웹 서버 컴포넌트에서 BlockNote로 read-time 렌더(`createContext` 에러 — pre-render만 사용)
- ❌ canonical/메타/JSON-LD 없이 새 콘텐츠 페이지 추가
- ❌ 새 라우트를 sitemap에 누락
- ❌ robots로 검색/AI 봇 차단(현재 정책: 전면 허용)
- ❌ 이미지 `alt` 누락, H1 다중 사용, 헤딩 레벨 건너뜀
- ❌ 의미 없는/중복 slug, 잦은 slug 변경(리다이렉트 없이)

---

## 7. 작업 전/후 절차

**작업 전**: 이 문서 + [`editor-architecture.md`](./editor-architecture.md)를 읽고, 위 1·2·3 체크리스트를 작업 범위에 적용한다.

**작업 후 검증**:
```bash
pnpm --filter web build      # 라우트/SSG/메타 생성 확인
curl localhost:3000/sitemap.xml   # 새 URL 포함 확인
curl localhost:3000/robots.txt    # 크롤러 허용 확인
curl localhost:3000/llms.txt      # 콘텐츠 인덱스 확인
# 글 페이지 HTML에 JSON-LD(BlogPosting/BreadcrumbList/FAQPage) 포함 확인
```
- 구조화 데이터는 배포 후 **Google Rich Results Test / Search Console**로 검증.
- 배포 시 **`NEXT_PUBLIC_SITE_URL`** 을 실제 도메인으로 설정(canonical·사이트맵 URL의 기준).

---

## 8. 백로그 (아직 미적용 — 추가 시 우선 검토)

- 글별 **동적 OG 이미지**(한글 폰트 에셋 필요, `opengraph-image.tsx`)
- 사이트 내 **검색** + `WebSite` `SearchAction`
- 본문 실제 이미지의 `next/image` 적용(LCP)
- 관련 글/시리즈 내부 링크 강화
- IndexNow·사이트맵 핑 자동화
