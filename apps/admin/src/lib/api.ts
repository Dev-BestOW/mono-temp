import { createApiClient } from "@repo/api";

const baseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000";

export const api = createApiClient({
  baseUrl,
  // Admin auth token (set after login). Swap for your auth mechanism.
  getToken: () => localStorage.getItem("admin_token") ?? undefined,
});
