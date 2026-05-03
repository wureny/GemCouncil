import { describe, expect, it, vi } from "vitest";
import { VoxCpmSpeechOutputProvider } from "./voxcpm-speech-output";

describe("VoxCpmSpeechOutputProvider", () => {
  it("posts interviewer text and voice profile to the speech synthesis route", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(init.method).toBe("POST");
      expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
      expect(JSON.parse(init.body as string)).toMatchObject({
        text: "Tell me about yourself.",
        voice: {
          id: "interviewer-default",
          label: "Interviewer",
        },
      });

      return Response.json({
        audioBase64: "UklGRg==",
        durationMs: 1200,
        mimeType: "audio/wav",
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new VoxCpmSpeechOutputProvider({ endpoint: "/api/speech/synthesize" });
    const result = await provider.speak("Tell me about yourself.", {
      id: "interviewer-default",
      label: "Interviewer",
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/speech/synthesize", expect.objectContaining({ method: "POST" }));
    expect(result).toEqual({
      url: "data:audio/wav;base64,UklGRg==",
      mimeType: "audio/wav",
      durationMs: 1200,
    });
  });

  it("surfaces service errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "VoxCPM backend unavailable." }, { status: 503 })),
    );

    const provider = new VoxCpmSpeechOutputProvider();

    await expect(
      provider.speak("Tell me about yourself.", {
        id: "interviewer-default",
        label: "Interviewer",
      }),
    ).rejects.toThrow("VoxCPM backend unavailable.");
  });
});
