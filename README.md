# mono-temp

SEO 최적화 유저웹(Next.js)과 어드민웹(React)을 하나의 디자인시스템으로 묶은 Turborepo 모노레포.

## 구조

```
apps/
  web/      # 유저웹 — Next.js 15 (App Router, SSR/SEO 최적화)
  admin/    # 어드민웹 — Vite + React 19 (SPA, noindex)
packages/
  ui/       # 디자인시스템 — 토큰(@theme) + 컴포넌트 (Tailwind v4)
  config/   # 공유 설정 — eslint / tsconfig / tailwind(postcss) preset
  utils/    # 공용 유틸 함수
  types/    # 공용 타입
```

## 기술 스택

- **모노레포**: pnpm workspaces + Turborepo
- **유저웹**: Next.js 15 · React 19 · App Router · 메타데이터/sitemap/robots/manifest/JSON-LD
- **어드민웹**: Vite 6 · React 19 · React Router 7
- **디자인시스템**: Tailwind CSS v4 (CSS-first `@theme` 토큰), CVA, tailwind-merge
- **언어**: TypeScript 5.7 (strict)

## 시작하기

```bash
pnpm install      # 의존성 설치
pnpm dev          # 유저웹(:3000) + 어드민웹(:3001) 동시 실행
pnpm build        # 전체 빌드 (Turbo 캐싱)
pnpm typecheck    # 전체 타입 체크
pnpm lint         # 전체 린트
```

개별 앱만 실행하려면:

```bash
pnpm --filter web dev
pnpm --filter admin dev
```

## 디자인시스템

- 토큰은 `packages/ui/src/styles/theme.css`의 `@theme` 블록에 정의되어 있고,
  light/dark 시맨틱 컬러는 `:root` / `.dark`의 CSS 변수로 교체됩니다.
- 각 앱은 글로벌 CSS에서 `@import "tailwindcss"` 다음에 이 토큰 파일을 import 하고,
  `@source`로 `@repo/ui` 소스를 스캔해 컴포넌트의 유틸리티 클래스를 생성합니다.
- 컴포넌트는 `@repo/ui`에서 그대로 import 합니다: `import { Button, Card } from "@repo/ui"`.

다크 모드는 `<html class="dark">` 토글로 활성화됩니다.
