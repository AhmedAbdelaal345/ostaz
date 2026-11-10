import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { runScheduledLessonReminders } from "../scheduledLessonReminders";
import { runScheduledPersonalReminders } from "../scheduledPersonalReminders";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";

/** Build the shared HTTP application without binding a port or starting jobs. */
export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  // Retain the existing limits for local/non-Vercel deployments. Vercel's
  // platform request limit is lower and cannot be raised by Express.
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.post("/api/scheduled/lesson-reminders", runScheduledLessonReminders);
  app.post("/api/scheduled/personal-reminders", runScheduledPersonalReminders);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Keep API failures machine-readable; do not expose internal error details.
  app.use("/api", (_req, res) => res.status(404).json({ error: "API route not found" }));
  app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.path.startsWith("/api/")) return next(error);
    const candidate = error as { status?: unknown; statusCode?: unknown };
    const statusValue = Number(candidate?.status ?? candidate?.statusCode);
    const status = Number.isInteger(statusValue) && statusValue >= 400 && statusValue <= 599 ? statusValue : 500;
    res.status(status).json({ error: status >= 500 ? "Internal server error" : "Invalid request" });
  });

  return app;
}
