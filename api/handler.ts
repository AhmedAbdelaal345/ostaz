import type { RequestListener } from "node:http";
import handler from "../serverless/vercelHandler.mjs";

// Vercel's plain api/ routing does not support Next.js catch-all filename
// semantics. vercel.json sends every /api/* URL here and provides its path.
const vercelHandler: RequestListener = handler;

export default vercelHandler;
