import { describe, expect, it, vi } from "vitest";
import { GemmaSpeechUnderstandingProvider } from "./gemma-speech-understanding";
import type { PracticeSession } from "@/domain/session";

const session: PracticeSession = {
  id: "session-1",
  mode: "interview",
  status: "active",
  createdAt: "2026-05-03T00:00:00.000Z",
  setup: {
    style: "standard",
    difficulty: "auto",
    goal: "General English interview",
  },
  turns: [
    {
      id: "turn-1",
      speakerId: "interviewer",
      speakerRole: "interviewer",
      text: "Tell me about yourself.",
      startedAt: "2026-05-03T00:00:01.000Z",
    },
  ],
};

describe("GemmaSpeechUnderstandingProvider", () => {
  it("posts audio and session context to the speech route", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = init.body as FormData;

      expect(body.get("durationMs")).toBe("1200");
      expect(body.get("mimeType")).toBe("audio/webm");
      expect(body.get("session")).toContain("Tell me about yourself.");

      return Response.json({
        transcript: "I am a product-minded engineer.",
        confidence: 0.92,
        language: "en",
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new GemmaSpeechUnderstandingProvider({ endpoint: "/api/speech/understand" });
    const result = await provider.understand(
      { blob: new Blob(["audio"], { type: "audio/webm" }), mimeType: "audio/webm", durationMs: 1200 },
      session,
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/speech/understand", expect.objectContaining({ method: "POST" }));
    expect(result).toMatchObject({
      transcript: "I am a product-minded engineer.",
      confidence: 0.92,
      language: "en",
    });
  });

  it("surfaces service errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "Gemma backend unavailable." }, { status: 503 })),
    );

    const provider = new GemmaSpeechUnderstandingProvider();

    await expect(
      provider.understand(
        { blob: new Blob(["audio"], { type: "audio/webm" }), mimeType: "audio/webm", durationMs: 1200 },
        session,
      ),
    ).rejects.toThrow("Gemma backend unavailable.");
  });
});
