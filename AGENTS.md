# AGENTS.md

이 모노레포에서 작업하는 에이전트가 따라야 할 규칙입니다. 코드 작성 전 이 파일을 우선 적용하세요.

## ⭐ 최우선 원칙 (1순위)

**유저 블로그웹(`apps/web`)의 모든 작업은 SEO/GEO/AEO 최적화가 최우선이다.**
`apps/web`을 건드리기 전에 **반드시 [`docs/seo-geo-aeo.md`](./docs/seo-geo-aeo.md)를 읽고** 그 체크리스트를 적용한다.
편의성·단순함·디자인이 검색/답변/생성형 엔진 노출과 충돌하면 **항상 최적화를 우선**한다.

## 프로젝트 개요

Turborepo + pnpm workspaces 모노레포.

- `apps/web` — 유저웹. **Next.js 15 (App Router)**, SSR/SEO 최적화.
- `apps/admin` — 어드민웹. **Vite + React 19**, SPA (`noindex`).
- `packages/ui` — 디자인시스템(`@repo/ui`): 토큰(`@theme`) + 공유 컴포넌트.
- `packages/config` — 공유 eslint / tsconfig / postcss preset (`@repo/config`).
- `packages/utils`, `packages/types` — 공용 유틸/타입.

## UI 컴포넌트 규칙 (필수)

전체 컨벤션: **[`docs/ui-conventions.md`](./docs/ui-conventions.md)** — UI 작업 전 반드시 확인.

핵심 규칙:

1. **위치 결정**
   - 유저웹 + 어드민 **둘 다** 쓰면 → `packages/ui` (`@repo/ui`)
   - **한 앱에서만** 쓰면 → 그 앱 안 (`apps/web/components`, `apps/admin/src/components`)
   - 화면/라우트 전용이면 → 그 feature/route 폴더 (`features/*/components`, Next는 `_components`)
   - 애매하면 → **앱 안에 둔다.** 두 번째 사용처가 생기면 그때 `@repo/ui`로 승격.
2. **의존성 방향은 한 방향**: `@repo/ui ← apps/*`. `@repo/ui`가 특정 앱을 import 하면 안 됨.
3. **디자인 토큰만 사용**: 색/간격/radius를 하드코딩하지 말고 토큰 클래스(`bg-primary`, `rounded-md` 등)를 쓴다. 임의값(`bg-[#...]`, `rounded-[8px]`) 금지. 토큰 정의는 `packages/ui/src/styles/theme.css`.
4. **승격 전 점검**: 앱 고유 로직(API 호출, 라우터, 전역 상태) 분리 → props/콜백으로 일반화 → 토큰만 사용 확인.

## 콘텐츠 에디터 (BlockNote)

전체 구조: **[`docs/editor-architecture.md`](./docs/editor-architecture.md)** — 콘텐츠/에디터 작업 전 확인.

핵심:

- 에디터는 **BlockNote**(노션식 블록). 콘텐츠 **원본은 BlockNote 블록 JSON**(HTML 아님). 저장/전송 타입은 `@repo/types`의 `Content`/`ContentInput`, 실제 블록 타입은 `@repo/editor`의 `PartialBlock`.
- 편집·렌더는 **동일 에디터(@repo/editor)** 사용. 커스텀 블록 추가 시 에디터/서버 렌더 스키마를 함께 맞춘다.
- **HTML은 저장 시점에 미리 렌더**한다: 어드민이 저장할 때 클라이언트에서 `blocksToHTML(blocks)`(`@repo/editor/editor`)로 변환해 `Content.bodyHtml`에 저장. 유저웹은 이 `bodyHtml`을 `dangerouslySetInnerHTML`로 그대로 출력하고 `@repo/editor/content.css`로 스타일링한다.
- ⚠️ **유저웹(RSC)에서 BlockNote로 read-time 서버 렌더를 하지 말 것** — `@blocknote/react`가 `createContext`를 써서 서버 컴포넌트에서 터진다. 그래서 pre-render(저장 시) 방식을 쓴다. `body`(JSON)는 재편집용으로 함께 저장.
- 커스텀 블록은 `@repo/editor/src/blocks/`에 `createReactBlockSpec`(반환 팩토리를 `schema.ts`에서 `()`로 호출)로 정의하고 `render`+`toExternalHTML` 둘 다 구현. 슬래시 메뉴 등록·`content.css` 스타일까지 함께. 표는 기본 제공. 절차는 docs 참고.
- 백엔드 통신은 **`@repo/api`** 클라이언트만 사용(앱에서 직접 fetch 금지).
- 이미지는 `onImageUpload`로 백엔드 업로드 후 **URL만 저장**(base64 금지).
- 에디터 의존 페이지는 `React.lazy`로 코드 스플리팅 유지.

## 메뉴/카테고리 & 유저웹 구조

유저웹은 KB Think(kbthink.com) 레이아웃을 벤치마크한 콘텐츠 사이트다.

- **메뉴(카테고리)** 는 `@repo/types`의 `CATEGORIES` 단일 소스. 유저웹 nav/footer와 어드민 카테고리 선택이 모두 여기서 읽는다. 메뉴 추가/이름변경은 이 배열만 수정.
- 콘텐츠는 `Content.categorySlug`로 메뉴에 속한다. 어드민 에디터에 카테고리 선택, 콘텐츠 목록은 `?category=`로 필터, `메뉴` 페이지에서 메뉴별 콘텐츠 관리.
- 유저웹 라우트: `/`(홈: 히어로+섹션), `/category/[slug]`(메뉴별 목록, SSG), `/blog/[slug]`(상세, SSG). 공용 컴포넌트는 `apps/web/components/`(SiteHeader/SiteFooter/ContentCard/Section).
- 백엔드 미연결 시 `apps/web/lib/sample.ts`의 더미 데이터로 레이아웃이 보인다(`hasBackend` 분기). 실데이터는 `@repo/api`.
- 콘텐츠 조회는 `apps/web/lib/api.ts`의 `getLatest`/`getByCategory` 헬퍼 사용(샘플 폴백 포함).

## SEO / AEO / GEO

**정본 규칙·체크리스트: [`docs/seo-geo-aeo.md`](./docs/seo-geo-aeo.md) (1순위, `apps/web` 작업 전 필독).** 아래는 요약.

유저웹은 검색·답변엔진·생성형엔진 노출에 맞춰 구성돼 있다.

- **구조화 데이터**: `apps/web/lib/structured-data.ts`가 단일 소스. 블로그=`BlogPosting`+`BreadcrumbList`+(`FAQPage`), 홈=`WebSite`+`Organization`. JSON-LD는 `<JsonLd>` 컴포넌트로 주입. publisher/로고는 `lib/site.ts`(SITE) 기반, 로고는 `/icon`.
- **사이트맵**: `app/sitemap.ts`가 홈+카테고리+전체 글 동적 생성(`getAllPublished`). 새 라우트 추가 시 여기에 반영.
- **robots**: `app/robots.ts` — 일반 봇 + AI 크롤러(GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended 등) **전면 허용**(GEO).
- **llms.txt**: `app/llms.txt/route.ts` — LLM용 콘텐츠 인덱스.
- **AEO 필드**: `Content.summary`(TL;DR, 본문 상단), `Content.faqs`(FAQ 섹션+FAQPage). 어드민 에디터에서 입력.
- 메타데이터는 `generateMetadata`(canonical/OpenGraph/article)로 페이지별 생성. 본문은 SSR HTML(pre-render)이라 크롤러·LLM이 JS 없이 읽음.
- ⚠️ 글별 동적 OG 이미지는 미적용(한글 폰트 번들 필요). 추가하려면 한글 폰트 에셋 + `opengraph-image.tsx`.

## 작업 후 검증

변경 후 관련 명령으로 확인하고 통과를 근거로 완료를 보고한다.

```bash
pnpm typecheck   # 타입
pnpm lint        # 린트 (0 errors 유지)
pnpm build       # 빌드 (필요 시 --filter web|admin 로 한정)
```

- 개별 앱: `pnpm --filter web <cmd>` / `pnpm --filter admin <cmd>`
- 새 컴포넌트는 가능한 한 디자인 토큰만으로 스타일링하고, 다크 모드(`.dark`)에서도 깨지지 않게 한다.

## 스타일/규약

- TypeScript strict. `import type` 사용(verbatimModuleSyntax).
- 컴포넌트는 `@repo/ui`에서 import: `import { Button, Card } from "@repo/ui"`.
- 클래스 병합은 `cn()`(`@repo/ui`) 사용.
