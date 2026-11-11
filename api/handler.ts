import type { Request, Response } from "express";
import app, { restoreVercelApiPath } from "../serverless/vercelHandler.mjs";

// Vercel's plain api/ routing does not support Next.js catch-all filename
// semantics. vercel.json sends every /api/* URL here and provides its path.
export default function handler(req: Request, res: Response) {
  restoreVercelApiPath(req);
  return app(req, res);
}
