import { describe, expect, it } from "vitest";
import { createInterviewSession, interviewReducer } from "./interview-session";
import { decideInterviewerPolicy, generateInterviewerResponse } from "./interviewer";
import type { ModelMessage, ModelReasoningProvider, ModelResponse } from "@/domain/providers";
import { MockModelReasoningProvider } from "@/providers/mock-providers";

describe("generateInterviewerResponse", () => {
  it("chooses a proactive opening policy before the user answers", () => {
    const decision = decideInterviewerPolicy(createInterviewSession().session);

    expect(decision.type).toBe("opening_question");
    expect(decision.instruction).toContain("Open the interview proactively");
  });

  it("generates a first interview question", async () => {
    const response = await generateInterviewerResponse(
      new MockModelReasoningProvider(),
      createInterviewSession().session,
    );

    expect(response.action.type).toBe("opening_question");
    expect(response.text).toContain("tell me about yourself");
  });

  it("generates a follow-up after a user answer", async () => {
    const state = interviewReducer(createInterviewSession(), {
      type: "USER_TURN_ADDED",
      turnId: "turn-1",
      text: "I want to practice concise answers.",
      at: "2026-05-02T00:00:00.000Z",
    });

    const response = await generateInterviewerResponse(new MockModelReasoningProvider(), state.session);

    expect(response.action.type).toBe("targeted_follow_up");
    expect(response.text).toContain("concrete example");
  });

  it("moves to a new question after a substantial answer", async () => {
    const state = interviewReducer(createInterviewSession(), {
      type: "USER_TURN_ADDED",
      turnId: "turn-1",
      text:
        "In my previous project, I coordinated with design and backend teams, clarified the release risk, and proposed a smaller scope that still solved the customer problem.",
      at: "2026-05-02T00:00:00.000Z",
    });

    const response = await generateInterviewerResponse(new MockModelReasoningProvider(), state.session);

    expect(response.action.type).toBe("next_topic");
    expect(response.text).toContain("difficult conversation");
  });

  it("passes the selected action object to the model prompt", async () => {
    const prompts: string[] = [];
    const state = interviewReducer(createInterviewSession(), {
      type: "USER_TURN_ADDED",
      turnId: "turn-1",
      text:
        "In my last project, I explained a delayed launch risk to the team, proposed a smaller milestone, and aligned design, backend, and customer support on the updated plan.",
      at: "2026-05-02T00:00:00.000Z",
    });

    await generateInterviewerResponse(
      {
        async generate(messages) {
          prompts.push(messages.at(-1)?.content ?? "");
          return { text: "What did you learn from that experience?" };
        },
      },
      state.session,
    );

    expect(prompts[0]).toContain("Interviewer action: next_topic");
    expect(prompts[0]).toContain("Action reason: The candidate gave enough signal to advance.");
    expect(prompts[0]).toContain("Action instruction: Briefly acknowledge the answer");
  });
});

class RecordingModelReasoningProvider implements ModelReasoningProvider {
  messages: ModelMessage[] = [];

  async generate(messages: ModelMessage[]): Promise<ModelResponse> {
    this.messages = messages;
    return { text: "Tell me about a product decision you made." };
  }
}
