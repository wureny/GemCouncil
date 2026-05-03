import { describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

describe("POST /api/speech/understand", () => {
  it("requires a configured Gemma backend URL", async () => {
    vi.stubEnv("GEMMA_SPEECH_API_URL", "");
    const body = new FormData();
    body.append("audio", new Blob(["audio"], { type: "audio/webm" }), "answer.webm");

    const response = await POST(new Request("http://localhost/api/speech/understand", { method: "POST", body }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("GEMMA_SPEECH_API_URL"),
    });
  });

  it("forwards recorded audio to the configured Gemma backend", async () => {
    vi.stubEnv("GEMMA_SPEECH_API_URL", "http://gemma.local");
    vi.stubEnv("GEMMA_SPEECH_API_KEY", "secret");
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = init.body as FormData;

      expect(body.get("durationMs")).toBe("1200");
      expect(body.get("mimeType")).toBe("audio/webm");
      expect((init.headers as Headers).get("Authorization")).toBe("Bearer secret");

      return Response.json({
        transcript: "I led the launch in English.",
        confidence: 0.88,
        language: "en",
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const body = new FormData();
    body.append("audio", new Blob(["audio"], { type: "audio/webm" }), "answer.webm");
    body.append("durationMs", "1200");
    body.append("mimeType", "audio/webm");

    const response = await POST(new Request("http://localhost/api/speech/understand", { method: "POST", body }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gemma.local/speech/understand",
      expect.objectContaining({ method: "POST" }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      transcript: "I led the launch in English.",
      confidence: 0.88,
      language: "en",
    });
  });
});

describe("GET /api/speech/understand", () => {
  it("reports unconfigured remote provider state", async () => {
    vi.stubEnv("GEMMA_SPEECH_API_URL", "");

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      configured: false,
      provider: "gemma-speech",
    });
  });

  it("checks the remote provider health endpoint", async () => {
    vi.stubEnv("GEMMA_SPEECH_API_URL", "https://gemma.example");
    vi.stubEnv("GEMMA_SPEECH_API_KEY", "secret");
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect((init.headers as Headers).get("Authorization")).toBe("Bearer secret");
      return Response.json({ ok: true, model_id: "google/gemma-3n-E2B-it" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://gemma.example/health",
      expect.objectContaining({ method: "GET" }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      configured: true,
      provider: "gemma-speech",
      remoteStatus: 200,
    });
  });
});
