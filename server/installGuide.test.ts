import { describe, expect, it } from "vitest";
import { detectInstallPlatform, isStandaloneApp, shouldShowInstallGuide } from "../shared/installGuide";

describe("install guide targeting", () => {
  it("identifies iPhone, Android, and iPadOS desktop-mode devices", () => {
    expect(detectInstallPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("ios");
    expect(detectInstallPlatform("Mozilla/5.0 (Linux; Android 15; Pixel 8)")).toBe("android");
    expect(detectInstallPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X)", "MacIntel", 5)).toBe("ios");
  });

  it("shows only on a mobile browser that has neither been dismissed nor installed", () => {
    expect(shouldShowInstallGuide({ platform: "ios", dismissed: false, standalone: false })).toBe(true);
    expect(shouldShowInstallGuide({ platform: "android", dismissed: true, standalone: false })).toBe(false);
    expect(shouldShowInstallGuide({ platform: "android", dismissed: false, standalone: true })).toBe(false);
    expect(isStandaloneApp(true, false)).toBe(true);
  });
});
