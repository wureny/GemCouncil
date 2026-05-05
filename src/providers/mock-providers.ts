import type {
  AudioInput,
  AudioOutput,
  ContextProvider,
  ContextResult,
  ModelMessage,
  ModelReasoningProvider,
  ModelResponse,
  SpeechOutputProvider,
  SpeechUnderstanding,
  SpeechUnderstandingProvider,
  VoiceProfile,
} from "@/domain/providers";
import type { PracticeSession } from "@/domain/session";
import { getInterviewScenarioPack } from "@/interview/scenario-packs";

export class MockSpeechUnderstandingProvider implements SpeechUnderstandingProvider {
  async understand(input: AudioInput, session: PracticeSession): Promise<SpeechUnderstanding> {
    void session;
    return {
      transcript: `Mock transcript for ${input.durationMs}ms answer.`,
      confidence: 1,
      language: "en",
    };
  }
}

export class MockSpeechOutputProvider implements SpeechOutputProvider {
  async speak(text: string, voice: VoiceProfile): Promise<AudioOutput> {
    return {
      url: `data:audio/mock,${encodeURIComponent(`${voice.id}:${text}`)}`,
      mimeType: "audio/mock",
      durationMs: Math.max(800, text.length * 35),
    };
  }
}

export class MockModelReasoningProvider implements ModelReasoningProvider {
  async generate(messages: ModelMessage[]): Promise<ModelResponse> {
    const last = messages.at(-1)?.content ?? "";

    if (last.includes("Open the interview proactively")) {
      return { text: "To start, could you tell me about yourself and what you are hoping to practice today?" };
    }

    if (last.includes("move the interview forward")) {
      return {
        text: "Thanks, that gives me a clearer picture. Now tell me about a difficult conversation you handled in English.",
      };
    }

    return {
      text: "That is a helpful start. Could you give one concrete example with more detail about your role and impact?",
    };
  }
}

export class MockContextProvider implements ContextProvider {
  async getContext(request: Parameters<ContextProvider["getContext"]>[0]): Promise<ContextResult> {
    const scenario = getInterviewScenarioPack(request.topic);
    return {
      title: scenario.label,
      prompts: scenario.questionPlan,
      source: "built-in",
    };
  }
}

export function createMockProviderSet() {
  return {
    speechUnderstanding: new MockSpeechUnderstandingProvider(),
    speechOutput: new MockSpeechOutputProvider(),
    modelReasoning: new MockModelReasoningProvider(),
    context: new MockContextProvider(),
  };
}

export function assertInterviewSession(session: PracticeSession): asserts session is PracticeSession & {
  mode: "interview";
} {
  if (session.mode !== "interview") {
    throw new Error("Expected an interview session.");
  }
}
