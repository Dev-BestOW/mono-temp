import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonVariants,
  cn,
} from "@repo/ui";
import { loadAllContents } from "../lib/seo-data";
import { analyzeContents, type SeoReport } from "../lib/seo-analysis";

function scoreClass(score: number): string {
  if (score >= 80) return "bg-primary/10 text-primary";
  if (score >= 50) return "bg-muted text-foreground";
  return "bg-destructive/10 text-destructive";
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
        scoreClass(score),
      )}
    >
      {score}
    </span>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((label) => (
        <span
          key={label}
          className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR");
}

export function DashboardPage() {
  const [report, setReport] = useState<SeoReport | null>(null);
  const [usingSample, setUsingSample] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadAllContents()
      .then(({ contents, usingSample }) => {
        if (!active) return;
        setReport(analyzeContents(contents));
        setUsingSample(usingSample);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEO 분석</h1>
          <p className="mt-1 text-muted-foreground">
            발행 콘텐츠의 SEO · AEO · GEO 상태를 진단합니다.
          </p>
        </div>
        {usingSample ? (
          <span className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
            샘플 데이터 (백엔드 미연결)
          </span>
        ) : null}
      </div>

      {loading || !report ? (
        <p className="mt-8 text-muted-foreground">분석 중…</p>
      ) : report.totalPublished === 0 ? (
        <p className="mt-8 text-muted-foreground">
          발행된 콘텐츠가 없습니다. 글을 발행하면 진단이 표시됩니다.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Headline metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>평균 SEO 점수</CardDescription>
                <CardTitle className="text-3xl">
                  {report.avgScore}
                  <span className="text-lg text-muted-foreground"> / 100</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">
                  발행 {report.totalPublished}건 · 초안 {report.totalDraft}건
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>AEO 보강 필요</CardDescription>
                <CardTitle className="text-3xl">{report.aeoGaps.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">
                  요약 또는 FAQ가 부족한 글
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>빈 카테고리</CardDescription>
                <CardTitle className="text-3xl">
                  {report.emptyCategories.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">
                  발행 콘텐츠 0건인 메뉴
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Low-score articles */}
          <section>
            <h2 className="text-lg font-bold">개선이 필요한 글</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              점수가 낮은 순. 빠진 항목을 채우면 점수가 올라갑니다.
            </p>
            <Card className="mt-3">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="p-4 font-medium">제목</th>
                      <th className="p-4 font-medium">점수</th>
                      <th className="p-4 font-medium">빠진 항목</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {report.articles.slice(0, 8).map((a) => (
                      <tr
                        key={a.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="p-4">
                          <div className="font-medium">{a.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.categoryName}
                          </div>
                        </td>
                        <td className="p-4">
                          <ScoreBadge score={a.score} />
                        </td>
                        <td className="p-4">
                          {a.missing.length ? (
                            <Chips items={a.missing} />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              없음
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/contents/${a.id}/edit`}
                            className={buttonVariants({
                              size: "sm",
                              variant: "outline",
                            })}
                          >
                            편집
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>

          {/* Category coverage */}
          <section>
            <h2 className="text-lg font-bold">카테고리 갭</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              비어 있는 메뉴는 빈 목록 페이지가 되어 SEO에 불리합니다.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {report.categories.map((c) => (
                <Link
                  key={c.slug}
                  to={`/contents?category=${c.slug}`}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted",
                    c.published === 0
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-card",
                  )}
                >
                  <span className="font-medium">{c.name}</span>
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      c.published === 0
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    발행 {c.published}
                    {c.draft ? ` · 초안 ${c.draft}` : ""}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Freshness + duplicates */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="text-lg font-bold">신선도 위험</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                6개월 이상 미수정 — 갱신하면 GEO 신선도 신호가 좋아집니다.
              </p>
              <Card className="mt-3">
                <CardContent className="p-4">
                  {report.stale.length ? (
                    <ul className="divide-y divide-border">
                      {report.stale.slice(0, 6).map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                        >
                          <Link
                            to={`/contents/${a.id}/edit`}
                            className="truncate font-medium hover:underline"
                          >
                            {a.title}
                          </Link>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {fmtDate(a.updatedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      오래된 글이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-lg font-bold">중복 / 충돌</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                같은 slug·제목·메타설명은 검색 순위를 갉아먹습니다.
              </p>
              <Card className="mt-3">
                <CardContent className="p-4">
                  {report.duplicates.length ? (
                    <ul className="divide-y divide-border">
                      {report.duplicates.map((d, i) => (
                        <li key={i} className="py-2 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                              {d.kind}
                            </span>
                            <span className="truncate text-sm font-medium">
                              {d.value}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {d.titles.join(" · ")}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      중복이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
