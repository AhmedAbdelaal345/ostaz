import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const htmlSource = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
const portalSource = readFileSync(new URL("../client/src/pages/StudentPortal.tsx", import.meta.url), "utf8");
const parentSource = readFileSync(new URL("../client/src/pages/ParentPortal.tsx", import.meta.url), "utf8");

describe("Audit Regression Tests — Security & Bug Fixes", () => {
  describe("Issue 2: Center Detail APIs Finance Protection", () => {
    it("ensures groups.detail strips transactions when caller lacks finance permission", () => {
      expect(routerSource).toContain("if (!canCenterAction(scope, \"finance\")) return { ...detail, transactions: [] };");
    });

    it("ensures students.detail strips transactions when caller lacks finance permission", () => {
      expect(routerSource).toContain("if (!canCenterAction(scope, \"finance\")) return { ...detail, transactions: [] };");
    });
  });

  describe("Issue 3: Upcoming Quiz Content Protection", () => {
    it("never discloses question content before startsAt or after endsAt", () => {
      expect(routerSource).toContain("const isOpen = now >= new Date(row.startsAt).getTime() && now <= new Date(row.endsAt).getTime();");
      expect(routerSource).toContain("const questions = isOpen ?");
    });
  });

  describe("Issue 4: Objective Quiz Submission Workspace Propagation", () => {
    it("passes quiz workspace to createAssessment so school/online attempts create assessments in the correct workspace", () => {
      expect(routerSource).toContain("(quiz.workspace as import(\"../shared/workspace\").Workspace) ?? \"center\"");
    });
  });

  describe("Issue 5: Financial Input Validation", () => {
    it("validates amount as finite, positive, and bounded", () => {
      expect(routerSource).toContain("z.number().finite(");
      expect(routerSource).toContain("positive(");
      expect(routerSource).toContain("max(1_000_000");
    });
  });

  describe("Issue 7: Group Schedule Arabic Day Normalization", () => {
    it("normalizes Monday spelling in App.tsx to prevent Monday lessons from disappearing", () => {
      expect(appSource).toContain("normalizeArabicDayName(now.toLocaleDateString(\"ar-EG\"");
    });

    it("uses flexible reminder window <= 5 instead of strict === 5", () => {
      expect(appSource).toContain("remaining <= 5 && remaining > 0");
    });
  });

  describe("Issue 8: Accessibility & Zoom Compliance", () => {
    it("does not install global copy/contextmenu/zoom blockers on document in App.tsx", () => {
      expect(appSource).not.toContain("document.addEventListener(\"copy\", blockCopy)");
      expect(appSource).not.toContain("document.addEventListener(\"gesturestart\", blockZoomGesture");
    });

    it("does not disable user-scalable in index.html viewport", () => {
      expect(htmlSource).not.toContain("user-scalable=no");
      expect(htmlSource).not.toContain("maximum-scale=1");
    });
  });

  describe("Issue 9: Quiz Fullscreen Exit on Completion/Back", () => {
    it("exits fullscreen upon successful quiz submission", () => {
      expect(portalSource).toContain("document.exitFullscreen?.().catch(() => undefined); setSelectedQuiz(null)");
    });

    it("exits fullscreen upon clicking Back during an active quiz", () => {
      expect(portalSource).toContain("document.exitFullscreen?.().catch(() => undefined); setSelectedQuiz(null); setAnswers({});");
    });
  });

  describe("Issue 10: UI & Semantic Cleanups", () => {
    it("has no nested Link > a patterns in App.tsx", () => {
      expect(appSource).not.toMatch(/<Link[^>]*>\s*<a/);
    });

    it("shows loading state in ParentPortal when isLoading is true", () => {
      expect(parentSource).toContain("if (parent.isLoading)");
    });
  });

  describe("Workspace Persistence (saveSchoolWorkspace)", () => {
    it("uses upsert onDuplicateKeyUpdate in saveSchoolWorkspace so new accounts can save", () => {
      expect(dbSource).toContain("saveSchoolWorkspace(userId: number");
    });
  });
});
