export type InstallPlatform = "ios" | "android" | "other";

export function detectInstallPlatform(userAgent: string, platform = "", maxTouchPoints = 0): InstallPlatform {
  const ios = /iPad|iPhone|iPod/i.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1);
  if (ios) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

export function isStandaloneApp(navigatorStandalone: boolean | undefined, displayModeStandalone: boolean) {
  return Boolean(navigatorStandalone || displayModeStandalone);
}

export function shouldShowInstallGuide(input: { platform: InstallPlatform; dismissed: boolean; standalone: boolean }) {
  return (input.platform === "ios" || input.platform === "android") && !input.dismissed && !input.standalone;
}
