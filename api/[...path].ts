import app from "../serverless/vercelHandler.mjs";

// The build emits the shared Express app as a self-contained ESM bundle. This
// wrapper stays small and never starts the local listener or background jobs.
export default app;
