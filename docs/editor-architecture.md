# 콘텐츠 에디터 아키텍처

어드민에서 작성한 콘텐츠가 유저웹에 SEO 친화적으로 노출되기까지의 구조.
에디터는 **BlockNote**(노션식 블록 에디터, ProseMirror/Tiptap 기반)를 사용한다.

## 큰 그림

```
어드민(Vite)                  @repo/editor                유저웹(Next)
ContentEditor  ──document──▶ BlockNote 블록 ──저장──▶ 별도 백엔드 서버 (DB)
(@repo/editor/editor)         (원본 JSON)      (@repo/api)        │
  슬래시·드래그·중첩·커스텀 블록                                  │ getBySlug
                                                                  ▼
                              renderContentToHTML  ◀── Server Component
                              (blocksToHTMLLossy)                │
                                                                  ▼
                                            시맨틱 HTML + content.css (SSG/ISR) → 검색 노출
```

## 핵심 원칙

1. **원본은 BlockNote 문서 JSON**(블록 배열). `Content.body` 타입은 `@repo/types`(느슨한 `unknown[]`), 실제 타입은 `@repo/editor`의 `PartialBlock`.
2. **스키마는 한 곳.** `@repo/editor/src/schema.ts`가 편집·렌더 공통 스키마(단일 소스). 기본 블록(`defaultBlockSpecs`, **표 포함**)에 커스텀 블록을 더한다.
3. **HTML은 저장 시점에 미리 렌더(pre-render).** 어드민이 저장할 때 **클라이언트에서** `blocksToHTML(blocks)`(`@repo/editor/editor`, `blocksToHTMLLossy` 사용)로 시맨틱 HTML(`<h2>`, `<aside class="callout">`, `<table>`…)을 만들어 `Content.bodyHtml`에 저장한다. 유저웹은 이 `bodyHtml`을 그대로 서버 렌더(SSG/ISR)로 출력 → SEO. **유저웹은 BlockNote 런타임을 전혀 거치지 않는다.**
   - ⚠️ 왜 read-time 서버 렌더가 아니라 pre-render인가: `@blocknote/react`가 `createContext`를 사용해 **Next 서버 컴포넌트(RSC)에서 `ServerBlockNoteEditor` 렌더가 터진다**(`createContext only works in Client Components`). 그래서 BlockNote가 정상 동작하는 어드민 클라이언트에서 미리 변환한다.
4. **편집 = 노출.** 유저웹은 `@repo/editor/content.css`로 `bodyHtml`을 스타일링하고, 에디터도 같은 CSS를 import 해 커스텀 블록이 동일하게 보인다.

## 커스텀 블록

`src/blocks/`에 정의하고 `schema.ts`에 등록한다. 각 블록은 두 가지 렌더를 가진다:

- `render` — 에디터 안에서의 모습(React)
- `toExternalHTML` — 서버/내보내기 HTML(유저웹 노출). 같은 클래스(`.callout`, `.embed`)를 써서 편집/노출 일치.

| 블록 | 설명 |
| --- | --- |
| `callout` | 이모지 + 색상 박스(info/warning/success/error), 인라인 편집 |
| `embed` | URL → 반응형 iframe(유튜브 자동 변환). 빈 상태면 URL 입력 폼 |
| `table` | BlockNote 기본 제공(별도 구현 없음) |

슬래시 메뉴 등록: `editor.tsx`에서 `getDefaultReactSlashMenuItems(editor)` + 커스텀 항목을 `SuggestionMenuController`에 넘긴다.

### 새 커스텀 블록 추가 절차

1. `src/blocks/<name>.tsx`에 `createReactBlockSpec({...}, { render, toExternalHTML })`로 정의. **`createReactBlockSpec(...)`는 팩토리를 반환** → 스키마에선 `name: nameBlock()`로 **호출**해서 등록.
2. `schema.ts`의 `blockSpecs`에 추가.
3. `editor.tsx`의 슬래시 메뉴에 삽입 항목 추가(`editor.insertBlocks`).
4. `content.css`에 해당 클래스 스타일 추가(편집·노출 공통).

## 패키지 역할

| 패키지 | 역할 |
| --- | --- |
| `@repo/editor` | BlockNote 에디터(`/editor`) + 스키마/커스텀 블록 + 서버 렌더(`renderContentToHTML`) + 콘텐츠 CSS(`/content.css`) |
| `@repo/api` | 별도 백엔드와 통신하는 타입 안전 클라이언트 |
| `@repo/types` | `Content`, `ContentInput`, `ContentSummary` 등 백엔드 계약 |

## 이미지 업로드

`ContentEditor`의 `onImageUpload(file) => Promise<url>`을 백엔드 업로드(`api.uploadImage`)에 연결한다. BlockNote의 `uploadFile`로 위임되며, 파일은 스토리지에 올리고 **URL만 저장**한다(base64 금지).

## 주의 (BlockNote + Next 통합)

- 유저웹 `next.config.ts`에 `serverExternalPackages: ["@blocknote/core", "@blocknote/react", "@blocknote/server-util"]` 유지.
- 서버 렌더 모듈(`render.ts`)은 `@blocknote/server-util`과 스키마를 **동적 import** 한다. 정적 page-data 수집 단계의 모듈 평가 크래시를 피하기 위함 — 실제 렌더 시에만 로드.
- 커스텀 React 블록 렌더는 내부적으로 react-dom을 쓴다. **개발 빌드**에선 plain-Node에서 스케줄러 경고(`window` 미정의)가 날 수 있으나 **프로덕션(Next 런타임)에선 발생하지 않음**(검증 완료).
- 유저웹 렌더는 `dangerouslySetInnerHTML`를 쓴다. 작성자는 인증된 어드민뿐이라 위험이 낮지만, **외부 사용자 작성까지 열 경우 서버에서 HTML 새니타이즈**(DOMPurify/sanitize-html)를 반드시 추가한다.
- 어드민 에디터 페이지는 `React.lazy`로 코드 스플리팅(BlockNote 번들 분리). 새 에디터 의존 페이지도 같은 패턴 유지.
