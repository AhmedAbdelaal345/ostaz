import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { dehydrate, hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import EntityProfile from "./pages/EntityProfile";
import StudentPortal from "./pages/StudentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import { OfflineRuntime } from "./components/OfflineRuntime";
import { enqueueTrpcRequest, flushOfflineQueue } from "./lib/offlineSync";
import "./index.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { networkMode: "offlineFirst", staleTime: 60_000, retry: 1 } } });
try {
  const cached = localStorage.getItem("ostazi-query-cache-v1");
  if (cached) hydrate(queryClient, JSON.parse(cached));
  queryClient.getQueryCache().subscribe(() => localStorage.setItem("ostazi-query-cache-v1", JSON.stringify(dehydrate(queryClient))));
} catch { /* local cache is optional */ }

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.assign("/teacher/login");
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      fetch(input, init) {
        if (!navigator.onLine && (init?.method || "GET").toUpperCase() === "POST") {
          enqueueTrpcRequest(String(input), init);
          return Promise.reject(new Error("OFFLINE_QUEUED"));
        }
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

const pathname = window.location.pathname;
const RootApp = pathname.startsWith("/student/") ? StudentPortal : pathname.startsWith("/teacher/") ? TeacherPortal : /^\/(students|groups)\/\d+$/.test(pathname) ? EntityProfile : App;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
}

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <RootApp />
      <OfflineRuntime />
    </QueryClientProvider>
  </trpc.Provider>
);
