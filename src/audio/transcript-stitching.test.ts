import { describe, expect, it } from "vitest";
import { stitchChunkTranscripts } from "./transcript-stitching";

describe("transcript stitching", () => {
  it("combines transcript chunks into one answer in index order", () => {
    const transcript = stitchChunkTranscripts([
      { index: 1, transcript: "and built reliable systems." },
      { index: 0, transcript: "I led the project" },
    ]);

    expect(transcript).toBe("I led the project and built reliable systems.");
  });

  it("normalizes whitespace while combining transcripts", () => {
    expect(
      stitchChunkTranscripts([
        { index: 0, transcript: "  I   enjoy\ncollaboration  " },
        { index: 1, transcript: "\twith product teams. " },
      ]),
    ).toBe("I enjoy collaboration with product teams.");
  });

  it("removes simple duplicated word overlap", () => {
    const transcript = stitchChunkTranscripts([
      { index: 0, transcript: "I improved the onboarding flow" },
      { index: 1, transcript: "the onboarding flow by simplifying setup" },
    ]);

    expect(transcript).toBe("I improved the onboarding flow by simplifying setup");
  });

  it("throws when a chunk failed", () => {
    expect(() =>
      stitchChunkTranscripts([
        { index: 0, transcript: "I started answering." },
        { index: 1, error: "Speech understanding failed." },
      ]),
    ).toThrow("Cannot stitch failed chunk 1: Speech understanding failed.");
  });
});
