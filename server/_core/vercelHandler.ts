import { createApp } from "./app";
import { restoreVercelApiPath } from "./vercelRequest";

/** Vercel function application; contains no listener or background startup. */
const app = createApp();

export default app;
export { restoreVercelApiPath };
