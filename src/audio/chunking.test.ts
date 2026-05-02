import { describe, expect, it } from "vitest";
import { planAudioChunks } from "./chunking";

describe("audio chunk planning", () => {
  it("keeps a short answer in one chunk", () => {
    expect(planAudioChunks({ durationMs: 12_000 })).toEqual([
      { index: 0, startMs: 0, endMs: 12_000 },
    ]);
  });

  it("splits a long answer without exceeding the model audio limit", () => {
    const chunks = planAudioChunks({ durationMs: 70_000 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.at(-1)?.endMs).toBe(70_000);
    expect(chunks.every((chunk) => chunk.endMs - chunk.startMs <= 30_000)).toBe(true);
  });

  it("throws for unsafe chunk configuration", () => {
    expect(() => planAudioChunks({ durationMs: 60_000, maxChunkMs: 30_001 })).toThrow(
      "maxChunkMs must not exceed 30000",
    );
  });

  it("returns no chunks for zero or negative duration", () => {
    expect(planAudioChunks({ durationMs: 0 })).toEqual([]);
    expect(planAudioChunks({ durationMs: -1 })).toEqual([]);
  });

  it("throws when overlap is not smaller than chunk duration", () => {
    expect(() =>
      planAudioChunks({ durationMs: 60_000, maxChunkMs: 25_000, overlapMs: 25_000 }),
    ).toThrow("overlapMs must be smaller than maxChunkMs");
  });

  it("throws for negative overlap", () => {
    expect(() => planAudioChunks({ durationMs: 60_000, overlapMs: -1 })).toThrow(
      "overlapMs must not be negative",
    );
  });
});
