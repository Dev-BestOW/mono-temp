import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, buttonVariants } from "@repo/ui";
import { CATEGORIES } from "@repo/types";
import { api } from "../lib/api";

export function MenusPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .listAll()
      .then((items) => {
        if (!active) return;
        const next: Record<string, number> = {};
        for (const item of items) {
          next[item.categorySlug] = (next[item.categorySlug] ?? 0) + 1;
        }
        setCounts(next);
      })
      .catch(() => active && setError("백엔드에 연결할 수 없습니다."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">메뉴</h1>
      <p className="mt-1 text-muted-foreground">
        메뉴(카테고리)별로 콘텐츠를 관리합니다.
      </p>
      {error ? <p className="mt-4 text-sm text-muted-foreground">{error}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Card key={category.slug}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <div className="font-semibold">{category.name}</div>
                <div className="text-sm text-muted-foreground">
                  {loading ? "…" : `${counts[category.slug] ?? 0}개 콘텐츠`}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/contents?category=${category.slug}`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  관리
                </Link>
                <Link
                  to={`/contents/new?category=${category.slug}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  새 글
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
