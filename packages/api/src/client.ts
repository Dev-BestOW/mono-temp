import type {
  Content,
  ContentInput,
  ContentSummary,
  UploadResult,
} from "@repo/types";

export interface ApiClientOptions {
  /** Base URL of the separate backend server, e.g. https://api.example.com */
  baseUrl: string;
  /** Optional bearer token provider (used by the admin). */
  getToken?: () => string | undefined | Promise<string | undefined>;
  /** Override fetch (e.g. to add Next.js cache options server-side). */
  fetch?: typeof fetch;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiClient {
  /** Published content for the user web (SEO pages), optionally by category. */
  listPublished(categorySlug?: string): Promise<ContentSummary[]>;
  getBySlug(slug: string): Promise<Content | null>;
  /** Admin: full list including drafts, optionally filtered by category. */
  listAll(categorySlug?: string): Promise<ContentSummary[]>;
  getById(id: string): Promise<Content | null>;
  create(input: ContentInput): Promise<Content>;
  update(id: string, input: ContentInput): Promise<Content>;
  remove(id: string): Promise<void>;
  /** Admin: upload an image, returns its public URL. */
  uploadImage(file: File): Promise<UploadResult>;
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const doFetch = options.fetch ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await options.getToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await doFetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
        ...init?.headers,
      },
    });
    if (res.status === 404) return null as T;
    if (!res.ok) {
      throw new ApiError(res.status, `${init?.method ?? "GET"} ${path} failed`);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  return {
    listPublished: (categorySlug) => {
      const params = new URLSearchParams({ status: "published" });
      if (categorySlug) params.set("category", categorySlug);
      return request<ContentSummary[]>(`/contents?${params.toString()}`);
    },
    getBySlug: (slug) =>
      request<Content | null>(`/contents/slug/${encodeURIComponent(slug)}`),
    listAll: (categorySlug) => {
      const query = categorySlug
        ? `?category=${encodeURIComponent(categorySlug)}`
        : "";
      return request<ContentSummary[]>(`/admin/contents${query}`);
    },
    getById: (id) => request<Content | null>(`/admin/contents/${id}`),
    create: (input) =>
      request<Content>("/admin/contents", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id, input) =>
      request<Content>(`/admin/contents/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    remove: (id) =>
      request<void>(`/admin/contents/${id}`, { method: "DELETE" }),
    async uploadImage(file) {
      const form = new FormData();
      form.append("file", file);
      const res = await doFetch(`${base}/admin/uploads`, {
        method: "POST",
        headers: await authHeaders(),
        body: form,
      });
      if (!res.ok) throw new ApiError(res.status, "image upload failed");
      return (await res.json()) as UploadResult;
    },
  };
}
