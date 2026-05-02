import { afterEach, describe, expect, it, vi } from "vitest";
import { playSpeechOutput } from "./speech-playback";

describe("playSpeechOutput", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("simulates mock speech playback for deterministic tests and demos", async () => {
    vi.useFakeTimers();

    const playback = playSpeechOutput({
      url: "data:audio/mock,hello",
      mimeType: "audio/mock",
      durationMs: 1200,
    });

    let finished = false;
    void playback.done.then(() => {
      finished = true;
    });

    await vi.advanceTimersByTimeAsync(1199);
    expect(finished).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(finished).toBe(true);
  });

  it("rejects when browser audio playback is unavailable for real audio", async () => {
    vi.stubGlobal("Audio", undefined);

    const playback = playSpeechOutput({
      url: "https://example.com/interviewer.mp3",
      mimeType: "audio/mpeg",
    });

    await expect(playback.done).rejects.toThrow("Audio playback is not available");
  });
});
