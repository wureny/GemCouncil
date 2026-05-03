import { afterEach, describe, expect, it, vi } from "vitest";
import { GemmaSpeechUnderstandingProvider } from "./gemma-speech-understanding";
import { createInterviewProviderSet, speechOutputProviderMode, speechUnderstandingProviderMode } from "./provider-set";
import { VoxCpmSpeechOutputProvider } from "./voxcpm-speech-output";

describe("createInterviewProviderSet", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses mock speech understanding by default", () => {
    const providers = createInterviewProviderSet();

    expect(speechUnderstandingProviderMode()).toBe("mock");
    expect(speechOutputProviderMode()).toBe("mock");
    expect(providers.speechUnderstanding).not.toBeInstanceOf(GemmaSpeechUnderstandingProvider);
    expect(providers.speechOutput).not.toBeInstanceOf(VoxCpmSpeechOutputProvider);
  });

  it("uses Gemma speech understanding when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER", "gemma");

    const providers = createInterviewProviderSet();

    expect(speechUnderstandingProviderMode()).toBe("gemma");
    expect(providers.speechUnderstanding).toBeInstanceOf(GemmaSpeechUnderstandingProvider);
  });

  it("uses VoxCPM speech output when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SPEECH_OUTPUT_PROVIDER", "voxcpm");

    const providers = createInterviewProviderSet();

    expect(speechOutputProviderMode()).toBe("voxcpm");
    expect(providers.speechOutput).toBeInstanceOf(VoxCpmSpeechOutputProvider);
  });
});
