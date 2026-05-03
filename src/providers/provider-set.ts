import { GemmaSpeechUnderstandingProvider } from "./gemma-speech-understanding";
import { createMockProviderSet } from "./mock-providers";

export type SpeechUnderstandingProviderMode = "mock" | "gemma";

export function createInterviewProviderSet() {
  const providers = createMockProviderSet();

  if (speechUnderstandingProviderMode() === "gemma") {
    return {
      ...providers,
      speechUnderstanding: new GemmaSpeechUnderstandingProvider(),
    };
  }

  return providers;
}

export function speechUnderstandingProviderMode(): SpeechUnderstandingProviderMode {
  return process.env.NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER === "gemma" ? "gemma" : "mock";
}
