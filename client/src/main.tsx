import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { dehydrate, hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import superjson from "superjson";
import { useLocation } from "wouter";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import EntityProfile from "./pages/EntityProfile";
import StudentPortal from "./pages/StudentPortal";
import ParentPortal from "./pages/ParentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import PlatformLanding from "./pages/PlatformLanding";
import { OfflineRuntime } from "./components/OfflineRuntime";
import { InstallGuide } from "./components/InstallGuide";
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

  const workspaceSwitchIsActive = () => {
    try {
      const startedAt = Number(sessionStorage.getItem("ostazi-workspace-switching"));
      if (startedAt && Date.now() - startedAt < 10_000) return true;
      sessionStorage.removeItem("ostazi-workspace-switching");
    } catch {
      // Session storage is optional in private browsing.
    }
    return false;
  };

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized || !navigator.onLine || workspaceSwitchIsActive()) return;

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

const workspaceScopedPath = /\/api\/trpc\/app\.(bootstrap|groups|students|attendance|finance|assessments|groupNotes|materials|community|assignments|video)/;
const activeWorkspace = () => {
  try {
    const value = localStorage.getItem("ostazi-workspace");
    return value === "school" || value === "center" || value === "online" ? value : "center";
  } catch {
    return "center";
  }
};
const injectWorkspace = (input: unknown, workspace: string): unknown => {
  if (!input || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(item => injectWorkspace(item, workspace));
  const record = input as Record<string, unknown>;
  if (record.json && typeof record.json === "object" && !Array.isArray(record.json)) {
    const payload = record.json as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(payload, "workspace")) return record;
    return { ...record, json: { ...payload, workspace } };
  }
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, injectWorkspace(value, workspace)]));
};
const scopeTrpcRequest = (input: RequestInfo | URL, init?: RequestInit) => {
  const source = String(input);
  if (!workspaceScopedPath.test(source)) return { input, init };
  const workspace = activeWorkspace();
  const nextInit = { ...(init ?? {}) };
  if (typeof nextInit.body === "string") {
    try { nextInit.body = JSON.stringify(injectWorkspace(JSON.parse(nextInit.body), workspace)); } catch { /* preserve malformed request body for the server */ }
  }
  try {
    const url = new URL(source, window.location.origin);
    const encoded = url.searchParams.get("input");
    const decoded = encoded ? JSON.parse(encoded) : { json: {} };
    url.searchParams.set("input", JSON.stringify(injectWorkspace(decoded, workspace)));
    return { input: url.toString(), init: nextInit };
  } catch {
    return { input, init: nextInit };
  }
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        const headers: Record<string, string> = {};
        try {
          const workspace = localStorage.getItem("ostazi-workspace");
          if (workspace === "school" || workspace === "center" || workspace === "online") headers["x-ostazi-workspace"] = workspace;
        } catch {
          // localStorage unavailable
        }
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
              headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return headers;
      },
      fetch(input, init) {
        const scoped = scopeTrpcRequest(input, init);
        if (!navigator.onLine && (scoped.init?.method || "GET").toUpperCase() === "POST") {
          enqueueTrpcRequest(String(scoped.input), scoped.init);
          return Promise.reject(new Error("OFFLINE_QUEUED"));
        }
        const request = globalThis.fetch(scoped.input, {
          ...(scoped.init ?? {}),
          credentials: "include",
        });
        if ((scoped.init?.method || "GET").toUpperCase() !== "POST") return request;
        return request.catch(error => { enqueueTrpcRequest(String(scoped.input), scoped.init); return Promise.reject(error); });
      },
    }),
  ],
});

const EL_MISTER_LOGO = "/manus-storage/el-mister-icon-512_951cf40b.png";

function RootRouter() {
  const [pathname] = useLocation();
  if (pathname === "/platform") return <PlatformLanding />;
  if (pathname.startsWith("/student/")) return <StudentPortal />;
  if (pathname.startsWith("/parent/")) return <ParentPortal />;
  if (pathname.startsWith("/teacher/")) return <TeacherPortal />;
  if (/^\/(students|groups)\/\d+$/.test(pathname)) return <EntityProfile />;
  return <App />;
}

function DirectAccessGuard({ children }: { children: React.ReactNode }) {
  const [pathname] = useLocation();
  const session = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0, refetchOnMount: "always" });
  useEffect(() => {
    const keepsOwnSession = pathname === "/platform" || pathname.startsWith("/student/") || pathname.startsWith("/parent/") || pathname.startsWith("/teacher/");
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
    if (import.meta.env.DEV) {
      await navigator.serviceWorker.getRegistrations().then(registrations => Promise.all(registrations.map(registration => registration.unregister())));
      return;
    }
    try {
      let reloadingForServiceWorker = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloadingForServiceWorker) return;
        reloadingForServiceWorker = true;
        window.location.reload();
      });
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
      <LanguageProvider><ErrorBoundary><DirectAccessGuard><BrandStartup><RootRouter /></BrandStartup></DirectAccessGuard></ErrorBoundary>
      <InstallGuide />
      <OfflineRuntime /></LanguageProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
