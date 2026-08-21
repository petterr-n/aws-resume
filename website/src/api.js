/**
 * Base path for the resume API.
 *
 * CloudFront serves /api/* from the HTTP API origin, so requests go to the
 * same origin as the site itself. Nothing is cross-origin, which means no
 * preflights, no CORS headers, and API traffic counted under CloudFront's
 * free tier rather than API Gateway's per-request price.
 *
 * In development, vite.config.js proxies /api to the same API so this value
 * works unchanged against `npm run dev`.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}
