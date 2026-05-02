import type { AudioInput, SpeechUnderstandingProvider } from "@/domain/providers";
import type { PracticeSession } from "@/domain/session";
import { planAudioChunks } from "./chunking";
import { stitchChunkTranscripts } from "./transcript-stitching";

export interface RecordedAnswerInput {
  audio: Blob;
  durationMs: number;
  mimeType: string;
  session: PracticeSession;
  speechUnderstanding: SpeechUnderstandingProvider;
}

export async function understandRecordedAnswer(input: RecordedAnswerInput): Promise<string> {
  const chunks = planAudioChunks({ durationMs: input.durationMs });

  if (chunks.length === 0) {
    throw new Error("Recorded answer must include audio duration.");
  }

  const transcripts = [];

  for (const chunk of chunks) {
    const audioInput: AudioInput = {
      blob: input.audio.slice(0, input.audio.size, input.mimeType),
      mimeType: input.mimeType,
      durationMs: chunk.endMs - chunk.startMs,
    };
    const result = await input.speechUnderstanding.understand(audioInput, input.session);
    transcripts.push({ index: chunk.index, transcript: result.transcript });
  }

  return stitchChunkTranscripts(transcripts);
}
