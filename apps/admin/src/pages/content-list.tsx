import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, buttonVariants } from "@repo/ui";
import { getCategory, type ContentSummary } from "@repo/types";
import { api } from "../lib/api";

export function ContentListPage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") ?? undefined;
  const category = categorySlug ? getCategory(categorySlug) : undefined;

  const [items, setItems] = useState<ContentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .listAll(categorySlug)
      .then((list) => active && setItems(list))
      .catch(() => active && setError("백엔드에 연결할 수 없습니다."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [categorySlug]);

  const newHref = categorySlug
    ? `/contents/new?category=${categorySlug}`
    : "/contents/new";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            콘텐츠{category ? ` · ${category.name}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {category
              ? `${category.name} 메뉴의 콘텐츠를 관리합니다.`
              : "에디터로 작성한 글을 관리합니다."}
          </p>
        </div>
        <div className="flex gap-2">
          {category ? (
            <Link to="/contents" className={buttonVariants({ variant: "outline" })}>
              전체 보기
            </Link>
          ) : null}
          <Link to={newHref} className={buttonVariants()}>
            새 글 작성
          </Link>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">불러오는 중…</p>
          ) : error ? (
            <p className="p-6 text-muted-foreground">{error}</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-muted-foreground">아직 작성된 글이 없습니다.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-4 font-medium">제목</th>
                  <th className="p-4 font-medium">메뉴</th>
                  <th className="p-4 font-medium">slug</th>
                  <th className="p-4 font-medium">상태</th>
                  <th className="p-4 font-medium">수정일</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">{item.title}</td>
                    <td className="p-4 text-muted-foreground">
                      {getCategory(item.categorySlug)?.name ?? item.categorySlug}
                    </td>
                    <td className="p-4 text-muted-foreground">{item.slug}</td>
                    <td className="p-4">
                      <span
                        className={
                          item.status === "published"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {item.status === "published" ? "발행됨" : "초안"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/contents/${item.id}/edit`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        편집
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
