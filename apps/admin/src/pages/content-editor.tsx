import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, CardContent, Input } from "@repo/ui";
import { ContentEditor, blocksToHTML } from "@repo/editor/editor";
import type { PartialBlock } from "@repo/editor";
import {
  CATEGORIES,
  DEFAULT_CATEGORY,
  type ContentInput,
  type ContentStatus,
  type FaqItem,
} from "@repo/types";

const fieldClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
import { slugify } from "@repo/utils";
import { api } from "../lib/api";

const emptyDoc: PartialBlock[] = [];

export function ContentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState(
    searchParams.get("category") ?? DEFAULT_CATEGORY.slug,
  );
  const [excerpt, setExcerpt] = useState("");
  const [summary, setSummary] = useState("");
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [body, setBody] = useState<PartialBlock[]>(emptyDoc);
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!id) return;
    let active = true;
    api.getById(id).then((content) => {
      if (!active || !content) return;
      setTitle(content.title);
      setSlug(content.slug);
      setCategorySlug(content.categorySlug);
      setExcerpt(content.excerpt);
      setSummary(content.summary ?? "");
      setFaqs(content.faqs);
      setBody(content.body as PartialBlock[]);
      setStatus(content.status);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const handleImageUpload = async (file: File) => {
    const { url } = await api.uploadImage(file);
    return url;
  };

  const addFaq = () => setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  const updateFaq = (index: number, field: keyof FaqItem, value: string) =>
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    );
  const removeFaq = (index: number) =>
    setFaqs((prev) => prev.filter((_, i) => i !== index));

  const save = async (nextStatus: ContentStatus) => {
    setSaving(true);
    // Pre-render HTML now so the user web can serve it without an editor runtime.
    const bodyHtml = await blocksToHTML(body);
    const payload: ContentInput = {
      title,
      slug: slug || slugify(title),
      categorySlug,
      excerpt,
      summary,
      faqs,
      body: body as ContentInput["body"],
      bodyHtml,
      status: nextStatus,
    };
    try {
      if (isEdit && id) {
        await api.update(id, payload);
      } else {
        await api.create(payload);
      }
      navigate("/contents");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <p className="text-muted-foreground">불러오는 중…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{isEdit ? "글 편집" : "새 글 작성"}</h1>
          <span className="text-sm text-muted-foreground">
            {status === "published" ? "발행됨" : "초안"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={saving} onClick={() => save("draft")}>
            초안 저장
          </Button>
          <Button disabled={saving || !title} onClick={() => save("published")}>
            발행
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-4 pt-6">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">제목</span>
            <Input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!isEdit && !slug) setSlug(slugify(event.target.value));
              }}
              placeholder="글 제목"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">slug (URL)</span>
            <Input
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              placeholder="my-first-post"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">메뉴 (카테고리)</span>
            <select
              value={categorySlug}
              onChange={(event) => setCategorySlug(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">요약 (검색 설명 · meta description)</span>
            <Input
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="검색 결과·미리보기에 노출될 요약"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">핵심 요약 (본문 상단 TL;DR)</span>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={2}
              className={fieldClass}
              placeholder="한두 문장으로 핵심을 먼저 제시 — AEO/스니펫·AI 답변에 유리"
            />
          </label>
        </CardContent>
      </Card>

      <div className="mt-4">
        <span className="mb-2 block text-sm font-medium">본문</span>
        <ContentEditor
          initialContent={body}
          onChange={(doc) => setBody(doc)}
          onImageUpload={handleImageUpload}
        />
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">자주 묻는 질문 (FAQ)</span>
              <p className="text-xs text-muted-foreground">
                FAQPage 구조화 데이터로 노출됩니다 — 답변 엔진·스니펫에 강력
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={addFaq}>
              + 질문 추가
            </Button>
          </div>

          {faqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 추가된 FAQ가 없습니다.</p>
          ) : (
            faqs.map((faq, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-md border border-border p-3"
              >
                <Input
                  value={faq.question}
                  onChange={(event) => updateFaq(index, "question", event.target.value)}
                  placeholder="질문"
                />
                <textarea
                  value={faq.answer}
                  onChange={(event) => updateFaq(index, "answer", event.target.value)}
                  rows={2}
                  className={fieldClass}
                  placeholder="답변"
                />
                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => removeFaq(index)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
