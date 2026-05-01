import { describe, expect, it } from "vitest";
import type { PracticeSession } from "./session";

describe("PracticeSession contracts", () => {
  it("represents an interview session with v0 feedback scores", () => {
    const session: PracticeSession = {
      id: "session-1",
      mode: "interview",
      status: "completed",
      createdAt: "2026-05-01T00:00:00.000Z",
      setup: {
        style: "random",
        difficulty: "auto",
        goal: "General English interview",
      },
      turns: [
        {
          id: "turn-1",
          speakerId: "interviewer",
          speakerRole: "interviewer",
          text: "Tell me about yourself.",
          startedAt: "2026-05-01T00:00:01.000Z",
        },
      ],
      report: {
        summary: "Clear answer with room for more specific examples.",
        scores: {
          clarity: 4,
          relevance: 4,
          listening: 3,
          fluency: 3,
          confidence: 3,
        },
        strengths: ["Structured opening"],
        improvements: ["Add concrete evidence"],
        betterAnswerExamples: ["I would frame the answer around one recent project."],
        nextPractice: ["Practice a two-minute self-introduction."],
      },
    };

    expect(session.mode).toBe("interview");
    expect(session.report?.scores.confidence).toBe(3);
  });

  it("represents a business meeting session", () => {
    const session: PracticeSession = {
      id: "session-2",
      mode: "meeting",
      status: "setup",
      createdAt: "2026-05-01T00:00:00.000Z",
      setup: {
        topic: "Should the team launch the beta next month?",
        meetingType: "business",
        participantCount: 3,
      },
      turns: [],
    };

    expect(session.setup).toMatchObject({ meetingType: "business" });
  });
});
