import type { FeedbackReport, PracticeSession } from "@/domain/session";

const MIN_SCORE = 1;
const MAX_SCORE = 5;

export function canGenerateInterviewFeedback(session: PracticeSession): boolean {
  return (
    session.mode === "interview" &&
    session.turns.some((turn) => turn.speakerRole === "interviewer") &&
    session.turns.some((turn) => turn.speakerRole === "user")
  );
}

export function createMockInterviewFeedback(session: PracticeSession): FeedbackReport {
  if (!canGenerateInterviewFeedback(session)) {
    throw new Error("At least one interviewer turn and one user answer are required.");
  }

  const report: FeedbackReport = {
    summary:
      "You answered the interviewer and kept the conversation moving. The next step is to make answers more concrete and easier to follow.",
    scores: {
      clarity: 4,
      relevance: 4,
      listening: 3,
      fluency: 3,
      confidence: 3,
    },
    strengths: ["You responded directly to the question.", "You maintained a professional tone."],
    improvements: [
      "Add one specific example with context, action, and result.",
      "Use shorter opening sentences before adding detail.",
    ],
    betterAnswerExamples: [
      "One example is a recent project where I owned the API design, coordinated with two teammates, and reduced release risk by testing the edge cases early.",
    ],
    nextPractice: [
      "Practice a 90-second self-introduction.",
      "Prepare two examples using situation, action, and result.",
    ],
  };

  assertValidFeedbackReport(report);
  return report;
}

export function assertValidFeedbackReport(report: FeedbackReport): void {
  for (const [name, score] of Object.entries(report.scores)) {
    if (!Number.isFinite(score) || score < MIN_SCORE || score > MAX_SCORE) {
      throw new Error(`Feedback score ${name} must be between ${MIN_SCORE} and ${MAX_SCORE}.`);
    }
  }

  const requiredArrays = [
    report.strengths,
    report.improvements,
    report.betterAnswerExamples,
    report.nextPractice,
  ];

  if (!report.summary.trim() || requiredArrays.some((items) => items.length === 0)) {
    throw new Error("Feedback report must include summary and non-empty recommendation arrays.");
  }
}
