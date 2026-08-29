import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

describe("contextual topbar and WhatsApp templates", () => {
  it("keeps a contextual topbar for operational areas", () => {
    expect(appSource).toContain("topbar-context-${contextualTopbar.id}");
    expect(appSource).toContain('id: "groups"');
    expect(appSource).toContain('id: "attendance"');
    expect(appSource).toContain('id: "finance"');
    expect(appSource).toContain('? "settings-messages" : "settings"');
  });

  it("offers ready WhatsApp templates in settings before saving a custom selection", () => {
    expect(appSource).toContain("MESSAGE_TEMPLATE_PRESETS");
    expect(appSource).toContain('id: "attendance-present"');
    expect(appSource).toContain('id: "attendance-absent"');
    expect(appSource).toContain('id: "payment-reminder"');
    expect(appSource).toContain('id: "weekly-report"');
    expect(appSource).toContain('id: "monthly-report"');
    expect(appSource).toContain('id: "exam-reminder"');
  });
});
