import { afterEach, describe, expect, it, vi } from "vitest";
import { GemmaSpeechUnderstandingProvider } from "./gemma-speech-understanding";
import { createInterviewProviderSet, speechUnderstandingProviderMode } from "./provider-set";

describe("createInterviewProviderSet", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses mock speech understanding by default", () => {
    const providers = createInterviewProviderSet();

    expect(speechUnderstandingProviderMode()).toBe("mock");
    expect(providers.speechUnderstanding).not.toBeInstanceOf(GemmaSpeechUnderstandingProvider);
  });

  it("uses Gemma speech understanding when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER", "gemma");

    const providers = createInterviewProviderSet();

    expect(speechUnderstandingProviderMode()).toBe("gemma");
    expect(providers.speechUnderstanding).toBeInstanceOf(GemmaSpeechUnderstandingProvider);
  });
});
