import type { ModelReasoningProvider } from "@/domain/providers";
import type { PracticeSession } from "@/domain/session";

export interface InterviewerResponse {
  text: string;
  action: InterviewerAction;
}

export type InterviewerActionType = "opening_question" | "targeted_follow_up" | "redirect" | "next_topic" | "close_interview";

export interface InterviewerAction {
  type: InterviewerActionType;
  instruction: string;
  reason?: string;
}

const vagueAnswerMarkers = ["not sure", "i don't know", "maybe", "kind of", "something"];

export function decideInterviewerPolicy(session: PracticeSession): InterviewerAction {
  const userTurns = session.turns.filter((turn) => turn.speakerRole === "user");

  if (userTurns.length === 0) {
    return {
      type: "opening_question",
      instruction:
        "Open the interview proactively with a brief professional greeting and ask exactly one first question.",
      reason: "The candidate has not answered yet.",
    };
  }

  const latestUserAnswer = userTurns.at(-1)?.text ?? "";
  const wordCount = latestUserAnswer.trim().split(/\s+/).filter(Boolean).length;
  const shouldFollowUp =
    wordCount < 18 || vagueAnswerMarkers.some((marker) => latestUserAnswer.toLowerCase().includes(marker));

  if (shouldFollowUp) {
    return {
      type: "targeted_follow_up",
      instruction:
        "Ask exactly one targeted follow-up because the candidate's latest answer needs more concrete detail.",
      reason: "The candidate's latest answer was short or vague.",
    };
  }

  return {
    type: "next_topic",
    instruction:
      "Briefly acknowledge the answer and move the interview forward with exactly one new question.",
    reason: "The candidate gave enough signal to advance.",
  };
}

export async function generateInterviewerResponse(
  provider: ModelReasoningProvider,
  session: PracticeSession,
): Promise<InterviewerResponse> {
  const userTurns = session.turns.filter((turn) => turn.speakerRole === "user");
  const decision = decideInterviewerPolicy(session);
  const latestUserAnswer = userTurns.at(-1)?.text ?? "No user answer yet.";

  const response = await provider.generate([
    {
      role: "system",
      content:
        "You are a proactive English interview practice interviewer. Conduct a realistic interview, not a passive chat. Start and advance the interview yourself, ask exactly one question at a time, wait for the candidate after each question, follow up when an answer is vague or too short, move to a new topic when enough signal is collected, and keep the tone professional and slightly challenging.",
    },
    {
      role: "user",
      content:
        `Interviewer action: ${decision.type}\nAction reason: ${decision.reason ?? "Not specified."}\nAction instruction: ${decision.instruction}\n\nLatest candidate answer: ${latestUserAnswer}`,
    },
  ]);

  return { text: response.text, action: decision };
}
