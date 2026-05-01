import { describe, expect, it } from "vitest";
import type {
  ContextProvider,
  ModelReasoningProvider,
  SpeechOutputProvider,
  SpeechUnderstandingProvider,
} from "./providers";
import type { PracticeSession } from "./session";

const session: PracticeSession = {
  id: "session-1",
  mode: "interview",
  status: "active",
  createdAt: "2026-05-01T00:00:00.000Z",
  setup: {
    style: "standard",
    difficulty: "auto",
  },
  turns: [],
};

describe("provider interfaces", () => {
  it("supports fake speech understanding providers", async () => {
    const provider: SpeechUnderstandingProvider = {
      async understand() {
        return { transcript: "I am ready for the interview.", confidence: 0.92 };
      },
    };

    const input = new Blob(["audio"], { type: "audio/webm" });
    const result = await provider.understand(
      { blob: input, mimeType: "audio/webm", durationMs: 1200 },
      session,
    );

    expect(result.transcript).toContain("ready");
  });

  it("supports fake speech output providers", async () => {
    const provider: SpeechOutputProvider = {
      async speak() {
        return { url: "blob:voice-output", mimeType: "audio/mpeg", durationMs: 900 };
      },
    };

    const result = await provider.speak("Welcome to GemCouncil.", {
      id: "interviewer-default",
      label: "Interviewer",
    });

    expect(result.mimeType).toBe("audio/mpeg");
  });

  it("supports fake reasoning and context providers", async () => {
    const model: ModelReasoningProvider = {
      async generate(messages) {
        return { text: messages.at(-1)?.content ?? "" };
      },
    };

    const context: ContextProvider = {
      async getContext() {
        return {
          title: "General interview",
          prompts: ["Tell me about yourself."],
          source: "built-in",
        };
      },
    };

    await expect(model.generate([{ role: "user", content: "Ask a question" }])).resolves.toEqual({
      text: "Ask a question",
    });
    await expect(context.getContext({ mode: "interview" })).resolves.toMatchObject({
      source: "built-in",
    });
  });
});
