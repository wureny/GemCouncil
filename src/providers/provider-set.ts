import { GemmaSpeechUnderstandingProvider } from "./gemma-speech-understanding";
import { createMockProviderSet } from "./mock-providers";
import { VoxCpmSpeechOutputProvider } from "./voxcpm-speech-output";

export type SpeechUnderstandingProviderMode = "mock" | "gemma";
export type SpeechOutputProviderMode = "mock" | "voxcpm";

export function createInterviewProviderSet() {
  const providers = createMockProviderSet();
  const configuredProviders = {
    ...providers,
    speechOutput:
      speechOutputProviderMode() === "voxcpm"
        ? new VoxCpmSpeechOutputProvider()
        : providers.speechOutput,
  };

  if (speechUnderstandingProviderMode() === "gemma") {
    return {
      ...configuredProviders,
      speechUnderstanding: new GemmaSpeechUnderstandingProvider(),
    };
  }

  return configuredProviders;
}

export function speechUnderstandingProviderMode(): SpeechUnderstandingProviderMode {
  return process.env.NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER === "gemma" ? "gemma" : "mock";
}

export function speechOutputProviderMode(): SpeechOutputProviderMode {
  return process.env.NEXT_PUBLIC_SPEECH_OUTPUT_PROVIDER === "voxcpm" ? "voxcpm" : "mock";
}
