import type { IncomingMessage } from "node:http";

const VERCEL_PATH_QUERY = "__vercel_path";

/** Restore the external API path after Vercel rewrites it to /api/handler. */
export function restoreVercelApiPath(request: Pick<IncomingMessage, "url">): void {
  const rewrittenUrl = new URL(request.url ?? "/", "http://vercel.local");
  const apiPath = rewrittenUrl.searchParams.get(VERCEL_PATH_QUERY);
  if (apiPath === null) return;

  rewrittenUrl.searchParams.delete(VERCEL_PATH_QUERY);
  const encodedPath = apiPath
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");
  request.url = `/api/${encodedPath}${rewrittenUrl.search}`;
}
