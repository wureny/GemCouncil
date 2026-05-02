import { describe, expect, it } from "vitest";
import { createInterviewSession, interviewReducer } from "./interview-session";
import { generateInterviewerResponse } from "./interviewer";
import { MockModelReasoningProvider } from "@/providers/mock-providers";

describe("generateInterviewerResponse", () => {
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
});
