/**
 * Base URL for the resume API.
 *
 * Today the API is a separate host, so calls are cross-origin and the HTTP API
 * enforces an origin allowlist. Once the API is served from /api/* on the same
 * CloudFront distribution as this site, set VITE_API_BASE_URL to "/api" (or
 * change the fallback below) and the requests become same-origin — at which
 * point the CORS configuration in template.yaml can be deleted.
 *
 * Defined in one place so that switch is a one-line change rather than a
 * search for hardcoded hostnames.
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://haianwilra.execute-api.eu-north-1.amazonaws.com/prod";

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}
