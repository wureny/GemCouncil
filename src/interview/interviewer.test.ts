import { describe, expect, it } from "vitest";
import { createInterviewSession, interviewReducer } from "./interview-session";
import { decideInterviewerPolicy, generateInterviewerResponse } from "./interviewer";
import { MockModelReasoningProvider } from "@/providers/mock-providers";

describe("generateInterviewerResponse", () => {
  it("chooses a proactive opening policy before the user answers", () => {
    const decision = decideInterviewerPolicy(createInterviewSession().session);

    expect(decision.kind).toBe("first_question");
    expect(decision.instruction).toContain("Open the interview proactively");
  });

  it("generates a first interview question", async () => {
    const response = await generateInterviewerResponse(
      new MockModelReasoningProvider(),
      createInterviewSession().session,
    );

    expect(response.kind).toBe("first_question");
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

    expect(response.kind).toBe("follow_up");
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

    expect(response.kind).toBe("next_question");
    expect(response.text).toContain("difficult conversation");
  });
});
