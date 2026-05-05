import type { ModelReasoningProvider } from "@/domain/providers";
import type { InterviewSetup, PracticeSession } from "@/domain/session";
import { scenarioPromptContext } from "./scenario-packs";

export interface InterviewerResponse {
  text: string;
  kind: "first_question" | "follow_up" | "next_question";
}

interface InterviewerPolicyDecision {
  kind: InterviewerResponse["kind"];
  instruction: string;
}

const vagueAnswerMarkers = ["not sure", "i don't know", "maybe", "kind of", "something"];

export function decideInterviewerPolicy(session: PracticeSession): InterviewerPolicyDecision {
  const userTurns = session.turns.filter((turn) => turn.speakerRole === "user");

  if (userTurns.length === 0) {
    return {
      kind: "first_question",
      instruction:
        "Open the interview proactively with a brief professional greeting and ask exactly one first question.",
    };
  }

  const latestUserAnswer = userTurns.at(-1)?.text ?? "";
  const wordCount = latestUserAnswer.trim().split(/\s+/).filter(Boolean).length;
  const shouldFollowUp =
    wordCount < 18 || vagueAnswerMarkers.some((marker) => latestUserAnswer.toLowerCase().includes(marker));

  if (shouldFollowUp) {
    return {
      kind: "follow_up",
      instruction:
        "Ask exactly one targeted follow-up because the candidate's latest answer needs more concrete detail.",
    };
  }

  return {
    kind: "next_question",
    instruction:
      "Briefly acknowledge the answer and move the interview forward with exactly one new question.",
  };
}

export async function generateInterviewerResponse(
  provider: ModelReasoningProvider,
  session: PracticeSession,
): Promise<InterviewerResponse> {
  const userTurns = session.turns.filter((turn) => turn.speakerRole === "user");
  const decision = decideInterviewerPolicy(session);
  const latestUserAnswer = userTurns.at(-1)?.text ?? "No user answer yet.";
  const scenarioContext = session.mode === "interview" ? scenarioPromptContext(session.setup as InterviewSetup) : "";

  const response = await provider.generate([
    {
      role: "system",
      content:
        "You are a proactive English interview practice interviewer. Conduct a realistic interview, not a passive chat. Start and advance the interview yourself, ask exactly one question at a time, wait for the candidate after each question, follow up when an answer is vague or too short, move to a new topic when enough signal is collected, and keep the tone professional and slightly challenging.",
    },
    {
      role: "user",
      content:
        `${decision.instruction}\n\n${scenarioContext}\n\nLatest candidate answer: ${latestUserAnswer}`,
    },
  ]);

  return { text: response.text, kind: decision.kind };
}
