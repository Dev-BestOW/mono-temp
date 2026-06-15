# 검색 성과 분석 연동 설계 (Search Console · GA4 · 네이버 서치어드바이저)

> **상태: 설계 (미구현).** 도메인 확정 + 배포 + 검색 노출 누적 이후에 활성화한다.
> 이 문서는 "나중에 키만 넣으면 켜지도록" 자료구조·API 계약·동기화·인증 구조를 미리 못박는다.

---

## 0. 목적

어드민 SEO 대시보드에서 **"어떤 검색어로 → 우리 사이트의 어떤 페이지에 유입됐는가"**, 그리고 그 페이지에서 사용자가 무엇을 했는가를 본다. 이는 **키워드 리서치와 다른 데이터**다.

| 구분 | 질문 | 소스 | 본 문서 |
| --- | --- | --- | --- |
| 키워드 리서치(수요) | 사람들이 *무엇을* 검색하나 (검색량·난이도) | 네이버 검색광고, DataForSEO | ❌ (별도) |
| **검색 성과(유입)** | *우리 사이트에* 무슨 검색어로 어떤 페이지에 유입됐나 | **GSC · GA4 · 서치어드바이저** | ✅ |

온페이지 진단(현재 어드민 대시보드, `apps/admin/src/lib/seo-analysis.ts`)은 우리가 가진 콘텐츠만으로 동작하지만, **검색 성과는 라이브 사이트의 실측**이라 외부 연동이 필수다.

---

## 1. 데이터 소스

| 소스 | 주는 것 | 키워드 제공 | 비용 | 비고 |
| --- | --- | --- | --- | --- |
| **Google Search Console API** (Search Analytics) | `query × page × date × device × country` + clicks/impressions/CTR/position | ✅ (정답) | 무료 | ~2~3일 지연, 희귀 검색어 익명화, 보존 ~16개월 |
| **GA4 — Data API** (`runReport`) | 랜딩페이지별 세션·engaged·전환, 유입 채널 | ❌ `(not provided)` | 무료 | 유입 *후 행동* 보강용 |
| **네이버 서치어드바이저** | 네이버 검색 유입 성과 | △ | 무료 | 한국 트래픽 핵심이나 **API 제한적**(주로 색인/검증). 초기엔 수동 CSV 업로드로 대체 가능 |

**원칙**: 검색어(query) 데이터는 **GSC가 단일 진실원**. GA4는 페이지 행동만, 네이버는 best-effort.

---

## 2. 아키텍처

```
┌────────────────┐   주기적 sync (서버 크론)   ┌──────────────────────┐
│ Google Search  │ ◀───────────────────────── │  백엔드 서버           │
│ Console / GA4  │   OAuth(서비스 계정)        │  (BACKEND_URL)        │
│ Naver SA       │                            │                       │
└────────────────┘                            │  ① fetch & 정규화      │
                                              │  ② DB 캐시(upsert)     │
                                              │  ③ 집계 API 제공        │
                                              └──────────┬───────────┘
                                                         │ @repo/api (읽기 전용)
                                                         ▼
                                              ┌──────────────────────┐
                                              │ 어드민 (Vite SPA)     │
                                              │  대시보드 "검색 성과"   │
                                              │  글 상세 "유입 검색어"  │
                                              └──────────────────────┘
```

핵심 결정:
- **모든 외부 호출은 백엔드에서.** 어드민(SPA)은 시크릿 키가 없고, 키를 프런트에 두면 노출·CORS·레이트리밋 문제. 어드민은 **캐시된 집계만 읽는다.**
- **검색량/성과는 매일 크게 안 변한다 → DB 캐시 + 주기 동기화.** 어드민 화면 로드마다 외부 API를 때리지 않는다.
- 모노레포가 건드리는 부분: `@repo/types`(공유 타입), `@repo/api`(읽기 메서드), `apps/admin`(화면). **백엔드 구현 자체는 분리된 서버**의 일.

---

## 3. 데이터 모델 (`@repo/types`)

백엔드가 정규화해 저장하고, 어드민이 읽는 공유 타입.

```ts
/** 검색 엔진별 일자 단위 성과 행 (GSC search analytics 정규화). */
export interface SearchPerfRow {
  date: string;               // YYYY-MM-DD
  source: "google" | "naver";
  query: string;
  /** 우리 글의 slug (URL→slug 매핑 후). 매핑 실패 시 원본 URL. */
  slug: string;
  clicks: number;
  impressions: number;
  ctr: number;                // 0~1
  position: number;           // 평균 게재순위
}

/** 집계: 검색어 단위 (기간 합산). */
export interface QueryStat {
  query: string;
  source: "google" | "naver";
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  /** 이 검색어가 유입시킨 상위 페이지. */
  topPages: { slug: string; clicks: number }[];
}

/** 집계: 페이지 단위 — "이 글에 어떤 검색어로 들어왔나". */
export interface PagePerf {
  slug: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: { query: string; clicks: number; impressions: number; position: number }[];
}

/** GA4: 유입 후 행동 (랜딩페이지 단위, organic). */
export interface PageEngagement {
  slug: string;
  sessions: number;
  engagedSessions: number;
  engagementRate: number;     // 0~1
  conversions: number;
}

export interface DateRange { start: string; end: string }  // YYYY-MM-DD
```

> `slug` 기준으로 저장하면 `Content`·온페이지 진단과 바로 조인된다. URL→slug 매핑은 `/blog/[slug]` 패턴에서 추출.

---

## 4. API 계약 (`@repo/api`)

`ApiClient`에 **읽기 전용** 메서드 추가 (백엔드 `/admin/analytics/*` 엔드포인트 소비).

```ts
export interface ApiClient {
  // ...기존...

  /** 기간 내 상위 검색어 (기본 google). */
  getTopQueries(range: DateRange, opts?: { source?: "google" | "naver"; limit?: number }): Promise<QueryStat[]>;

  /** 한 글에 유입된 검색어 — 글 상세 드릴다운용. */
  getPagePerformance(slug: string, range: DateRange): Promise<PagePerf | null>;

  /** "기회" 검색어: 노출 높은데 CTR 낮음 / 게재순위 5~15(striking distance). */
  getOpportunities(range: DateRange, opts?: { limit?: number }): Promise<QueryStat[]>;

  /** GA4 랜딩페이지 행동 (organic). */
  getPageEngagement(range: DateRange): Promise<PageEngagement[]>;
}
```

대응 백엔드 엔드포인트(예시):
- `GET /admin/analytics/queries?start&end&source&limit`
- `GET /admin/analytics/pages/:slug?start&end`
- `GET /admin/analytics/opportunities?start&end&limit`
- `GET /admin/analytics/engagement?start&end`

모두 **캐시 테이블 조회**(외부 API 직접 호출 아님). 인증은 기존 admin Bearer 토큰 재사용.

---

## 5. 동기화 잡 (백엔드)

| 항목 | 값 |
| --- | --- |
| 주기 | 1일 1회 (크론). 데이터 지연 보정 위해 **최근 3일 재수집(upsert)** |
| GSC 호출 | `POST .../sites/{siteUrl}/searchAnalytics/query`, `dimensions:["date","query","page"]`, `rowLimit:25000` + `startRow` 페이지네이션 |
| GA4 호출 | Data API `runReport`, dim `landingPagePlusQueryString` + 채널=Organic Search, metric `sessions/engagedSessions/engagementRate/conversions` |
| 정규화 | URL→slug 변환, 날짜·소스별 upsert (중복 방지 키: `date+source+query+slug`) |
| 보존 | 16개월 (GSC 한계와 일치), 이후 월 단위 롤업 |
| 레이트리밋 | GSC 쿼터 준수, 429 시 지수 백오프 |
| 멱등성 | 같은 날 재실행해도 upsert라 안전 |

네이버 서치어드바이저는 자동화 API가 약하므로 **초기엔 수동 CSV 업로드 → 같은 `SearchPerfRow`로 정규화**하는 경로를 둔다(`source:"naver"`).

---

## 6. 인증 · 시크릿 (백엔드 env)

| 변수 | 용도 |
| --- | --- |
| `GSC_SITE_URL` | 대상 속성 (예: `sc-domain:example.com` 또는 `https://...`) |
| `GOOGLE_SA_JSON` | GSC/GA4용 **서비스 계정** 키(JSON). 속성에 사용자로 추가 |
| `GA4_PROPERTY_ID` | GA4 속성 ID |
| (선택) `NAVER_SA_*` | 서치어드바이저 사용 시 |

- **서비스 계정 방식 권장**(서버 크론에 적합, 사용자 OAuth 동의창 불필요). GSC 속성·GA4 속성에 해당 서비스 계정 이메일을 *사용자로 추가*.
- 모든 시크릿은 **백엔드에만**. 어드민/`NEXT_PUBLIC_*`에 절대 두지 않는다.

---

## 7. 어드민 화면 (대시보드 확장)

기존 SEO 분석 대시보드(`apps/admin/src/pages/dashboard.tsx`)에 **"검색 성과" 섹션**을 추가하고, 글 상세 진단에 **"유입 검색어"** 블록을 둔다.

- 헤드라인: 총 클릭·노출·평균 CTR·평균 순위 (기간 선택)
- **상위 검색어** 테이블 (query → topPages)
- **기회 검색어**: 노출↑·CTR↓ 또는 순위 5~15 → "조금만 손보면 오를 글" (온페이지 진단과 연결: 해당 글 [편집])
- **페이지별 유입 검색어**: 글 클릭 시 그 글에 들어온 검색어 목록
- GA4: 랜딩페이지별 세션·체류·전환

**폴백**: 데이터 없거나(런칭 전) 백엔드 미연결이면 *"검색 성과 데이터는 사이트 배포·색인 후 수집됩니다"* 안내. 온페이지 진단 섹션은 그대로 동작(외부 무관).

---

## 8. 사전 준비 / 런칭 체크리스트

검색 성과 데이터는 아래가 다 갖춰진 **이후에야** 쌓인다:

- [ ] **도메인 확정** → `NEXT_PUBLIC_SITE_URL` 설정 (빌드 가드가 강제)
- [ ] 사이트 **배포** + 검색엔진 색인 시작
- [ ] **GSC 속성 등록 + 소유 인증**
  - Next.js로 간편 인증: `app/layout.tsx` metadata에 `verification: { google: "<토큰>" }` 추가 (HTML 태그 방식), 또는 DNS TXT
  - `sitemap.xml`(이미 `app/sitemap.ts`로 존재) GSC에 제출
- [ ] **GA4 속성** 생성 + 사이트에 태그 설치, GA4↔GSC 연동
- [ ] (선택) **네이버 서치어드바이저** 사이트 등록·소유 확인
- [ ] **서비스 계정** 생성 → GSC·GA4 속성에 사용자 추가, `GOOGLE_SA_JSON` 백엔드 주입
- [ ] 백엔드 sync 잡 가동 → 며칠 데이터 누적 후 어드민 섹션 활성화

> 데이터는 노출/클릭이 며칠~몇 주 쌓여야 의미 있다. 런칭 직후 화면이 비어 보이는 건 정상.

---

## 9. 단계적 적용

1. **(지금) 설계 고정** — 본 문서. 타입/계약/체크리스트 확정.
2. **(런칭 후) GSC 연동** — 소유 인증 → 서비스 계정 → sync 잡 → `getTopQueries`/`getPagePerformance` → 어드민 "검색 성과" 섹션.
3. **GA4 보강** — 랜딩페이지 행동.
4. **기회 검색어 루프** — 온페이지 진단 점수 + 성과(순위/CTR) 결합해 "개선 우선순위" 자동 정렬.
5. **(선택) 네이버 서치어드바이저** — 수동 CSV → API화.

---

## 10. 미결 결정사항

- 보고 기간 기본값(28일 vs 3개월)과 비교(전기간 대비) 필요 여부
- 네이버 성과를 수동 CSV로 시작할지, 정식 연동까지 보류할지
- 전환(conversions) 정의 — 구독·특정 페이지 도달 등 (GA4 이벤트 설계 선행)
- 다국어/지역 차원 저장 여부 (현재 ko-KR 단일 → 단순화 가능)
```

관련 문서: [`seo-geo-aeo.md`](./seo-geo-aeo.md) (온페이지·구조화 데이터), 어드민 온페이지 진단 `apps/admin/src/lib/seo-analysis.ts`.
