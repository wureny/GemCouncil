import type { ConversationTurn, InterviewSetup, PracticeSession } from "@/domain/session";

export type InterviewPhase =
  | "setup"
  | "ready_for_user"
  | "listening"
  | "processing_user_answer"
  | "processing_interviewer"
  | "speaking"
  | "feedback_ready"
  | "completed"
  | "failed";

export interface InterviewRuntimeState {
  session: PracticeSession;
  phase: InterviewPhase;
  maxUserTurns: number;
  userTurnCount: number;
  error?: string;
}

export type InterviewEvent =
  | {
      type: "INTERVIEWER_TURN_ADDED";
      turnId: string;
      text: string;
      audioUrl?: string;
      at: string;
    }
  | {
      type: "USER_TURN_ADDED";
      turnId: string;
      text: string;
      at: string;
    }
  | { type: "START_LISTENING" }
  | { type: "STOP_LISTENING" }
  | { type: "END_EARLY" }
  | { type: "USER_ANSWER_FAILED"; message: string }
  | { type: "RESET_ERROR" };

export function createInterviewSession(options?: {
  setup?: Partial<InterviewSetup>;
  maxUserTurns?: number;
  now?: string;
}): InterviewRuntimeState {
  const setup: InterviewSetup = {
    goal: options?.setup?.goal ?? "General English interview",
    targetContext: options?.setup?.targetContext,
    selfIntroduction: options?.setup?.selfIntroduction,
    backgroundNotes: options?.setup?.backgroundNotes,
    style: options?.setup?.style ?? "random",
    difficulty: options?.setup?.difficulty ?? "auto",
  };

  return {
    session: {
      id: crypto.randomUUID(),
      mode: "interview",
      status: "setup",
      createdAt: options?.now ?? new Date().toISOString(),
      setup,
      turns: [],
    },
    phase: "setup",
    maxUserTurns: options?.maxUserTurns ?? 5,
    userTurnCount: 0,
  };
}

export function interviewReducer(
  state: InterviewRuntimeState,
  event: InterviewEvent,
): InterviewRuntimeState {
  switch (event.type) {
    case "INTERVIEWER_TURN_ADDED": {
      const turn: ConversationTurn = {
        id: event.turnId,
        speakerId: "interviewer",
        speakerRole: "interviewer",
        text: event.text,
        audioUrl: event.audioUrl,
        startedAt: event.at,
      };

      return {
        ...state,
        phase: "ready_for_user",
        error: undefined,
        session: {
          ...state.session,
          status: "active",
          turns: [...state.session.turns, turn],
        },
      };
    }

    case "START_LISTENING":
      return {
        ...state,
        phase: "listening",
      };

    case "STOP_LISTENING":
      return {
        ...state,
        phase: "processing_user_answer",
      };

    case "USER_TURN_ADDED": {
      const turn: ConversationTurn = {
        id: event.turnId,
        speakerId: "user",
        speakerRole: "user",
        text: event.text,
        startedAt: event.at,
      };
      const userTurnCount = state.userTurnCount + 1;

      return {
        ...state,
        phase:
          userTurnCount >= state.maxUserTurns
            ? "feedback_ready"
            : "processing_interviewer",
        userTurnCount,
        error: undefined,
        session: {
          ...state.session,
          status: "active",
          turns: [...state.session.turns, turn],
        },
      };
    }

    case "END_EARLY":
      return {
        ...state,
        phase: "feedback_ready",
        error: undefined,
      };

    case "USER_ANSWER_FAILED":
      return {
        ...state,
        phase: "failed",
        error: event.message,
        session: {
          ...state.session,
          status: "failed",
        },
      };

    case "RESET_ERROR":
      return {
        ...state,
        phase: "ready_for_user",
        error: undefined,
        session: {
          ...state.session,
          status: "active",
        },
      };
  }
}
