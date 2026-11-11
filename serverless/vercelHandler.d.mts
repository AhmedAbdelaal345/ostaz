import type { RequestListener } from "node:http";
import type { IncomingMessage } from "node:http";

declare const handler: RequestListener;
export default handler;
export declare function restoreVercelApiPath(request: Pick<IncomingMessage, "url">): void;
