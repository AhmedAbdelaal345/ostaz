const AUTH_DRAFT_KEY = "el-mister-auth-phone-draft";

type AuthPhoneDraft = {
  accountPhone?: string;
  teacherPhone?: string;
  studentPhone?: string;
};

export function readAuthPhoneDraft(): AuthPhoneDraft {
  try {
    const saved = sessionStorage.getItem(AUTH_DRAFT_KEY);
    if (!saved) return {};
    const draft: unknown = JSON.parse(saved);
    if (!draft || typeof draft !== "object") return {};
    const candidate = draft as Record<string, unknown>;
    return {
      accountPhone: typeof candidate.accountPhone === "string" ? candidate.accountPhone : undefined,
      teacherPhone: typeof candidate.teacherPhone === "string" ? candidate.teacherPhone : undefined,
      studentPhone: typeof candidate.studentPhone === "string" ? candidate.studentPhone : undefined,
    };
  } catch {
    return {};
  }
}

export function saveAuthPhoneDraft(update: Partial<AuthPhoneDraft>) {
  try {
    sessionStorage.setItem(AUTH_DRAFT_KEY, JSON.stringify({ ...readAuthPhoneDraft(), ...update }));
  } catch {
    // Remembering a phone between auth roles is optional when storage is blocked.
  }
}

export function clearAuthPhoneDraft() {
  try {
    sessionStorage.removeItem(AUTH_DRAFT_KEY);
  } catch {
    // Storage can be unavailable in private browsing; authentication still works.
  }
}
