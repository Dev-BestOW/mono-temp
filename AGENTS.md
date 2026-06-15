# AGENTS.md

이 모노레포에서 작업하는 에이전트가 따라야 할 규칙입니다. 코드 작성 전 이 파일을 우선 적용하세요.

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
