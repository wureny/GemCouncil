import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

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
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = init.body as FormData;

      expect(body.get("durationMs")).toBe("1200");
      expect(body.get("mimeType")).toBe("audio/webm");

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
