import { describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

describe("POST /api/speech/synthesize", () => {
  it("requires a configured VoxCPM backend URL", async () => {
    vi.stubEnv("VOXCPM_TTS_API_URL", "");

    const response = await POST(
      new Request("http://localhost/api/speech/synthesize", {
        method: "POST",
        body: JSON.stringify({ text: "Tell me about yourself." }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("VOXCPM_TTS_API_URL"),
    });
  });

  it("forwards text and voice to the configured VoxCPM backend", async () => {
    vi.stubEnv("VOXCPM_TTS_API_URL", "https://voxcpm.example");
    vi.stubEnv("VOXCPM_TTS_API_KEY", "secret");
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect((init.headers as Headers).get("Authorization")).toBe("Bearer secret");
      expect((init.headers as Headers).get("Content-Type")).toBe("application/json");
      expect(JSON.parse(init.body as string)).toMatchObject({
        text: "Tell me about yourself.",
        voice: { id: "interviewer-default" },
      });

      return Response.json({
        audioBase64: "UklGRg==",
        durationMs: 1200,
        mimeType: "audio/wav",
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost/api/speech/synthesize", {
        method: "POST",
        body: JSON.stringify({
          text: "Tell me about yourself.",
          voice: { id: "interviewer-default" },
        }),
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://voxcpm.example/speech/synthesize",
      expect.objectContaining({ method: "POST" }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      audioBase64: "UklGRg==",
      durationMs: 1200,
      mimeType: "audio/wav",
    });
  });
});

describe("GET /api/speech/synthesize", () => {
  it("reports unconfigured remote provider state", async () => {
    vi.stubEnv("VOXCPM_TTS_API_URL", "");

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      configured: false,
      provider: "voxcpm-tts",
    });
  });

  it("checks the remote provider health endpoint", async () => {
    vi.stubEnv("VOXCPM_TTS_API_URL", "https://voxcpm.example");
    vi.stubEnv("VOXCPM_TTS_API_KEY", "secret");
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect((init.headers as Headers).get("Authorization")).toBe("Bearer secret");
      return Response.json({ ok: true, model_id: "openbmb/VoxCPM2" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://voxcpm.example/health",
      expect.objectContaining({ method: "GET" }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      configured: true,
      provider: "voxcpm-tts",
      remoteStatus: 200,
    });
  });
});
