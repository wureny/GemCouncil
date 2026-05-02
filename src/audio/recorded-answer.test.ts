import { describe, expect, it } from "vitest";
import { createInterviewSession } from "@/interview/interview-session";
import { MockSpeechUnderstandingProvider } from "@/providers/mock-providers";
import { understandRecordedAnswer } from "./recorded-answer";

describe("understandRecordedAnswer", () => {
  it("understands one short recorded answer", async () => {
    const transcript = await understandRecordedAnswer({
      audio: new Blob(["audio"], { type: "audio/webm" }),
      durationMs: 1200,
      mimeType: "audio/webm",
      session: createInterviewSession().session,
      speechUnderstanding: new MockSpeechUnderstandingProvider(),
    });

    expect(transcript).toBe("Mock transcript for 1200ms answer.");
  });

  it("understands long answers through multiple safe chunks", async () => {
    const transcript = await understandRecordedAnswer({
      audio: new Blob(["audio"], { type: "audio/webm" }),
      durationMs: 52_000,
      mimeType: "audio/webm",
      session: createInterviewSession().session,
      speechUnderstanding: new MockSpeechUnderstandingProvider(),
    });

    expect(transcript).toContain("Mock transcript for 25000ms answer.");
    expect(transcript).toContain("Mock transcript for 4000ms answer.");
  });

  it("rejects empty recordings", async () => {
    await expect(
      understandRecordedAnswer({
        audio: new Blob([""], { type: "audio/webm" }),
        durationMs: 0,
        mimeType: "audio/webm",
        session: createInterviewSession().session,
        speechUnderstanding: new MockSpeechUnderstandingProvider(),
      }),
    ).rejects.toThrow("Recorded answer must include audio duration.");
  });
});
