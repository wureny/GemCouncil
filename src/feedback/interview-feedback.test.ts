import { describe, expect, it } from "vitest";
import { createInterviewSession, interviewReducer } from "@/interview/interview-session";
import {
  assertValidFeedbackReport,
  canGenerateInterviewFeedback,
  createMockInterviewFeedback,
} from "./interview-feedback";

function answeredSession() {
  const withQuestion = interviewReducer(createInterviewSession(), {
    type: "INTERVIEWER_TURN_ADDED",
    turnId: "turn-1",
    text: "Tell me about yourself.",
    at: "2026-05-02T00:00:00.000Z",
  });

  return interviewReducer(withQuestion, {
    type: "USER_TURN_ADDED",
    turnId: "turn-2",
    text: "I am practicing concise interview answers.",
    at: "2026-05-02T00:00:10.000Z",
  }).session;
}

describe("interview feedback", () => {
  it("requires at least one user answer", () => {
    expect(canGenerateInterviewFeedback(createInterviewSession().session)).toBe(false);
  });

  it("generates valid mock feedback", () => {
    const report = createMockInterviewFeedback(answeredSession());

    expect(report.scores.clarity).toBe(4);
    expect(report.nextPractice.length).toBeGreaterThan(0);
  });

  it("enforces bounded scores", () => {
    expect(() =>
      assertValidFeedbackReport({
        ...createMockInterviewFeedback(answeredSession()),
        scores: {
          clarity: 6,
          relevance: 4,
          listening: 3,
          fluency: 3,
          confidence: 3,
        },
      }),
    ).toThrow("Feedback score clarity must be between 1 and 5.");
  });
});
