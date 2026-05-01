import type { PracticeSession } from "./session";

export interface AudioInput {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export interface SpeechUnderstanding {
  transcript: string;
  confidence?: number;
  language?: string;
  notes?: string[];
}

export interface VoiceProfile {
  id: string;
  label: string;
  speakingRate?: number;
}

export interface AudioOutput {
  url: string;
  mimeType: string;
  durationMs?: number;
}

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelResponse {
  text: string;
  raw?: unknown;
}

export interface ContextRequest {
  mode: PracticeSession["mode"];
  topic?: string;
  background?: string;
}

export interface ContextResult {
  title: string;
  prompts: string[];
  source: "built-in" | "search";
}

export interface SpeechUnderstandingProvider {
  understand(input: AudioInput, session: PracticeSession): Promise<SpeechUnderstanding>;
}

export interface SpeechOutputProvider {
  speak(text: string, voice: VoiceProfile): Promise<AudioOutput>;
}

export interface ModelReasoningProvider {
  generate(messages: ModelMessage[]): Promise<ModelResponse>;
}

export interface ContextProvider {
  getContext(request: ContextRequest): Promise<ContextResult>;
}
