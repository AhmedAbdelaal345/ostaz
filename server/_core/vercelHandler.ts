import type { IncomingMessage, RequestListener, ServerResponse } from "node:http";
import { createApp } from "./app";
import { restoreVercelApiPath } from "./vercelRequest";

/** Restore Vercel's rewrite and forward the original Node request to Express. */
export function createVercelHandler(application: RequestListener): RequestListener {
  return (request: IncomingMessage, response: ServerResponse) => {
    restoreVercelApiPath(request);
    application(request, response);
  };
}

/** Vercel function handler; contains no listener or background startup. */
const handler = createVercelHandler(createApp());

export default handler;
export { restoreVercelApiPath };
