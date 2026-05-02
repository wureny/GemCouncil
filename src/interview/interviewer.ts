import type { ModelReasoningProvider } from "@/domain/providers";
import type { PracticeSession } from "@/domain/session";

export interface InterviewerResponse {
  text: string;
  kind: "first_question" | "follow_up" | "next_question";
}

export async function generateInterviewerResponse(
  provider: ModelReasoningProvider,
  session: PracticeSession,
): Promise<InterviewerResponse> {
  const userTurns = session.turns.filter((turn) => turn.speakerRole === "user");
  const kind: InterviewerResponse["kind"] = userTurns.length === 0 ? "first_question" : "follow_up";
  const latestUserAnswer = userTurns.at(-1)?.text ?? "No user answer yet.";

  const response = await provider.generate([
    {
      role: "system",
      content:
        "You are a concise English interview practice interviewer. Ask one question at a time.",
    },
    {
      role: "user",
      content:
        kind === "first_question"
          ? "Start a general English interview with one opening question."
          : `Ask a useful follow-up to this answer: ${latestUserAnswer}`,
    },
  ]);

  return { text: response.text, kind };
}
