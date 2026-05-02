const DEFAULT_MAX_CHUNK_MS = 25_000;
const DEFAULT_OVERLAP_MS = 1_000;
const MODEL_MAX_AUDIO_MS = 30_000;

export interface AudioChunkPlanningInput {
  durationMs: number;
  maxChunkMs?: number;
  overlapMs?: number;
}

export interface AudioChunkPlan {
  index: number;
  startMs: number;
  endMs: number;
}

export function planAudioChunks(input: AudioChunkPlanningInput): AudioChunkPlan[] {
  const maxChunkMs = input.maxChunkMs ?? DEFAULT_MAX_CHUNK_MS;
  const overlapMs = input.overlapMs ?? DEFAULT_OVERLAP_MS;

  if (maxChunkMs > MODEL_MAX_AUDIO_MS) {
    throw new Error("maxChunkMs must not exceed 30000");
  }

  if (overlapMs < 0) {
    throw new Error("overlapMs must not be negative");
  }

  if (overlapMs >= maxChunkMs) {
    throw new Error("overlapMs must be smaller than maxChunkMs");
  }

  if (input.durationMs <= 0) {
    return [];
  }

  const chunks: AudioChunkPlan[] = [];
  let startMs = 0;

  while (startMs < input.durationMs) {
    const endMs = Math.min(startMs + maxChunkMs, input.durationMs);
    chunks.push({ index: chunks.length, startMs, endMs });

    if (endMs === input.durationMs) {
      break;
    }

    startMs = endMs - overlapMs;
  }

  return chunks;
}
