import { createApiClient } from "@repo/api";

/**
 * Base URL of the separate backend server (server-side only).
 * Set `BACKEND_URL` in the environment. When unset, pages degrade gracefully
 * (empty lists / not-found) so the app still builds without a backend.
 */
const backendUrl = process.env.BACKEND_URL ?? "";

export const hasBackend = backendUrl.length > 0;

export const api = createApiClient({
  baseUrl: backendUrl || "http://localhost:4000",
});
