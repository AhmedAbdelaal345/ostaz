import { createApp } from "../server/_core/app";

// Vercel invokes this shared Express app for /api/* requests. It deliberately
// does not import the local listener entry point or start a background task.
const app = createApp();

export default app;
