import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, Input } from "@repo/ui";
import { ContentEditor } from "@repo/editor/editor";
import type { PartialBlock } from "@repo/editor";
import type { ContentInput, ContentStatus } from "@repo/types";
import { slugify } from "@repo/utils";
import { api } from "../lib/api";

const emptyDoc: PartialBlock[] = [];

export function ContentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
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
      setExcerpt(content.excerpt);
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

  const save = async (nextStatus: ContentStatus) => {
    setSaving(true);
    const payload: ContentInput = {
      title,
      slug: slug || slugify(title),
      excerpt,
      body: body as ContentInput["body"],
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
            <span className="text-sm font-medium">요약 (검색 설명)</span>
            <Input
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="검색 결과·미리보기에 노출될 요약"
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
    </div>
  );
}
