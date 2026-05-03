import { afterEach, describe, expect, it, vi } from "vitest";
import { configuredRemoteProvider, fetchWithTimeout, remoteProviderHeaders } from "./remote-provider";

describe("remote provider helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads base URL, API key, and timeout from environment", () => {
    vi.stubEnv("REMOTE_URL", "https://provider.example");
    vi.stubEnv("REMOTE_KEY", "secret");
    vi.stubEnv("REMOTE_TIMEOUT", "45000");

    expect(
      configuredRemoteProvider({
        apiKeyEnv: "REMOTE_KEY",
        baseUrlEnv: "REMOTE_URL",
        defaultTimeoutMs: 30000,
        timeoutEnv: "REMOTE_TIMEOUT",
      }),
    ).toEqual({
      apiKey: "secret",
      baseUrl: "https://provider.example",
      timeoutMs: 45000,
    });
  });

  it("adds bearer auth only when an API key is configured", () => {
    expect(remoteProviderHeaders("secret").get("Authorization")).toBe("Bearer secret");
    expect(remoteProviderHeaders().has("Authorization")).toBe(false);
  });

  it("turns aborts into explicit timeout errors", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        });
      }),
    );

    const request = expect(fetchWithTimeout("https://provider.example/health", {}, 10)).rejects.toThrow(
      "timed out after 10ms",
    );
    await vi.advanceTimersByTimeAsync(10);

    await request;
  });
});
