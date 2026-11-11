import type { Express } from "express";
import type { IncomingMessage } from "node:http";

declare const app: Express;
export default app;
export declare function restoreVercelApiPath(request: Pick<IncomingMessage, "url">): void;
