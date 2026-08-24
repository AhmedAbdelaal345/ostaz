import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { dehydrate, hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import superjson from "superjson";
import App from "./App";
import EntityProfile from "./pages/EntityProfile";
import StudentPortal from "./pages/StudentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import { OfflineRuntime } from "./components/OfflineRuntime";
import { enqueueTrpcRequest, flushOfflineQueue } from "./lib/offlineSync";
import { LanguageProvider } from "./contexts/LanguageContext";
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
        const request = globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
        if ((init?.method || "GET").toUpperCase() !== "POST") return request;
        return request.catch(error => { enqueueTrpcRequest(String(input), init); return Promise.reject(error); });
      },
    }),
  ],
});

const pathname = window.location.pathname;
const RootApp = pathname.startsWith("/student/") ? StudentPortal : pathname.startsWith("/teacher/") ? TeacherPortal : /^\/(students|groups)\/\d+$/.test(pathname) ? EntityProfile : App;
const EL_MISTER_LOGO = "/manus-storage/el-mister-logo_65d8a1da.jpg";

function DirectAccessGuard({ children }: { children: React.ReactNode }) {
  const session = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0, refetchOnMount: "always" });
  useEffect(() => {
    const keepsOwnSession = pathname.startsWith("/student/") || pathname.startsWith("/teacher/");
    if (!keepsOwnSession && session.isFetchedAfterMount && !session.isFetching && !session.data) window.location.replace("/teacher/login");
  }, [session.isFetchedAfterMount, session.isFetching, session.data]);
  return <>{children}</>;
}

function BrandStartup({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setVisible(false), 900); return () => window.clearTimeout(timer); }, []);
  return <>{visible && <div className="brand-startup" role="status" aria-label="جارٍ فتح El Mister"><div className="brand-startup-glow"/><img src={EL_MISTER_LOGO} alt="El Mister"/><div><strong>El Mister</strong><span>المستر</span></div></div>}{children}</>;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await registration.update();
      window.dispatchEvent(new Event("ostazi-service-worker-ready"));
    } catch (error) {
      console.warn("[PWA] تعذر تسجيل عامل الخدمة", error);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider><DirectAccessGuard><BrandStartup><RootApp /></BrandStartup></DirectAccessGuard>
      <OfflineRuntime /></LanguageProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
