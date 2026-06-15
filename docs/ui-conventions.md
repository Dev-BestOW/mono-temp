# UI 컴포넌트 관리 컨벤션

이 모노레포에서 UI 컴포넌트를 **어디에 둘지**, **언제 공유 패키지로 올릴지**에 대한 규칙입니다.

## 1. 한 줄 원칙

> **"어디서 쓰이는가"로 위치를 정한다. 공유는 두 번째 사용처가 생겼을 때.**

성급하게 `@repo/ui`에 넣지 않는다. 애매하면 **일단 앱 안에 둔다.**

## 2. 위치 결정 규칙

| 쓰이는 범위 | 위치 |
| --- | --- |
| 유저웹 + 어드민 **둘 다** | `packages/ui` (`@repo/ui`) |
| **한 앱에서만** | 그 앱 폴더 (`apps/web/components`, `apps/admin/src/components`) |
| 특정 화면/라우트 **전용** | 그 feature/route 폴더 안 (아래 구조 참고) |
| 애매함 | 앱 안에 둔다 → 재사용 필요해지면 그때 승격 |

## 3. 디렉토리 구조

### 공유 디자인시스템 — `packages/ui`

앱 2개 이상에서 쓰는 범용·무상태에 가까운 컴포넌트와 디자인 토큰만.

```
packages/ui/src/
  components/      # Button, Card, Input ...
  lib/             # cn 등 유틸
  styles/          # theme.css (디자인 토큰)
```

### 유저웹 — `apps/web`

```
apps/web/
  components/
    ui/            # 이 앱 한정 범용 컴포넌트
    sections/      # Hero, FeatureGrid 등 페이지 섹션
  app/
    (marketing)/
      _components/  # 해당 라우트 전용 (Next 컨벤션: _ 접두사 = 라우팅 제외)
```

### 어드민 — `apps/admin`

```
apps/admin/src/
  components/
    ui/            # 이 앱 한정 범용 (DataTable, Pagination ...)
  layouts/         # AdminLayout, Sidebar
  features/
    users/
      components/  # UserTable, UserFilterBar — users 화면 전용
      hooks/
  pages/
```

## 4. 의존성 방향 (반드시 한 방향)

```
@repo/ui  ←  apps/web
          ←  apps/admin
```

- ✅ 앱 전용 컴포넌트가 `@repo/ui`를 import (예: `<Button>` 위에 조립) — **권장**
- ❌ `@repo/ui`가 특정 앱을 import — **금지**. 공유 패키지가 앱에 의존하면 순환·결합이 생긴다.

## 5. 디자인 토큰은 어디 있든 공유

앱 전용 컴포넌트라도 색/간격/radius는 직접 하드코딩하지 말고 `@repo/ui` 토큰을 쓴다.

```tsx
// ✅ 토큰 사용 — 위치와 무관하게 디자인 일관성 유지
<div className="bg-primary text-primary-foreground rounded-md" />

// ❌ 하드코딩 — 디자인시스템 이탈
<div className="bg-[#4f46e5] rounded-[8px]" />
```

토큰 정의: `packages/ui/src/styles/theme.css` (`@theme` 블록 + `:root`/`.dark` CSS 변수)

## 6. 공유 패키지로 승격(promote)하는 시점

앱 안에 있던 컴포넌트가 **두 번째 앱에서도 필요해질 때** `@repo/ui`로 옮긴다. 이때 점검:

1. **앱 고유 로직 분리** — 특정 API 호출, 라우터(`useNavigate` 등), 전역 상태 의존이 섞여 있으면 분리한다. 공유 컴포넌트는 props/콜백으로 받는다.
2. **일반화 가능 여부** — props로 충분히 범용화되는가? 한 앱의 특수 요구가 박혀 있으면 아직 올리지 않는다.
3. **토큰만 사용하는가** — 임의 색/사이즈가 없는지 확인.

> 비유: `@repo/ui`는 **레고 블록**(범용·무상태에 가까움), 앱 폴더는 **그 블록으로 만든 완성품**(도메인 결합 OK).

## 7. 빠른 체크리스트

새 컴포넌트를 만들기 전에:

- [ ] 지금 이걸 쓰는 앱이 **하나인가, 둘인가?** → 하나면 앱 안에.
- [ ] `@repo/ui`에 **비슷한 게 이미 있나?** → 있으면 조합하거나 확장.
- [ ] 색/간격을 **토큰으로** 쓰고 있나?
- [ ] (공유로 올린다면) **앱 고유 로직이 빠졌나?**
