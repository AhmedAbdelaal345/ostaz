import { afterEach, describe, expect, it, vi } from "vitest";
import { hasValidCronSecret } from "./_core/scheduledAuth";

const requestWithAuthorization = (authorization?: string) =>
  ({ headers: authorization ? { authorization } : {} }) as never;

describe("scheduled endpoint authorization", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts the configured bearer secret", () => {
    const secret = "a".repeat(64);
    vi.stubEnv("CRON_SECRET", secret);

    expect(hasValidCronSecret(requestWithAuthorization(`Bearer ${secret}`), secret)).toBe(true);
  });

  it("rejects missing, short, malformed, and incorrect secrets", () => {
    const secret = "b".repeat(64);
    vi.stubEnv("CRON_SECRET", secret);

    expect(hasValidCronSecret(requestWithAuthorization(), secret)).toBe(false);
    expect(hasValidCronSecret(requestWithAuthorization(secret), secret)).toBe(false);
    expect(hasValidCronSecret(requestWithAuthorization(`Bearer ${"c".repeat(64)}`), secret)).toBe(false);
    expect(hasValidCronSecret(requestWithAuthorization("Bearer short"), "short")).toBe(false);
  });
});
