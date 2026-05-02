import { describe, expect, it } from "vitest";
import {
  createInterviewSession,
  interviewReducer,
  type InterviewEvent,
  type InterviewRuntimeState,
} from "./interview-session";

describe("interview session state", () => {
  it("creates a default interview session", () => {
    const state = createInterviewSession();

    expect(state.session.mode).toBe("interview");
    expect(state.session.status).toBe("setup");
    expect(state.session.setup).toMatchObject({
      style: "random",
      difficulty: "auto",
      goal: "General English interview",
    });
    expect(state.phase).toBe("setup");
  });

  it("starts with an interviewer turn and becomes ready for user answer", () => {
    const started = interviewReducer(createInterviewSession(), {
      type: "INTERVIEWER_TURN_ADDED",
      turnId: "turn-1",
      text: "Tell me about yourself.",
      audioUrl: "blob:interviewer",
      at: "2026-05-01T00:00:00.000Z",
    });

    expect(started.phase).toBe("ready_for_user");
    expect(started.session.status).toBe("active");
    expect(started.session.turns).toHaveLength(1);
    expect(started.session.turns[0]).toMatchObject({
      id: "turn-1",
      speakerId: "interviewer",
      speakerRole: "interviewer",
      text: "Tell me about yourself.",
      audioUrl: "blob:interviewer",
      startedAt: "2026-05-01T00:00:00.000Z",
    });
  });

  it("moves through listening and user-answer processing phases", () => {
    const ready = {
      ...createInterviewSession(),
      phase: "ready_for_user" as const,
    };

    const listening = interviewReducer(ready, { type: "START_LISTENING" });
    const processing = interviewReducer(listening, { type: "STOP_LISTENING" });

    expect(listening.phase).toBe("listening");
    expect(processing.phase).toBe("processing_user_answer");
  });

  it("marks feedback-ready when the turn budget is reached", () => {
    const base = createInterviewSession({ maxUserTurns: 1 });
    let state: InterviewRuntimeState = {
      ...base,
      phase: "ready_for_user",
      session: { ...base.session, status: "active" },
    };

    const event: InterviewEvent = {
      type: "USER_TURN_ADDED",
      turnId: "turn-2",
      text: "I am a product-minded engineer.",
      at: "2026-05-01T00:00:05.000Z",
    };

    state = interviewReducer(state, event);

    expect(state.phase).toBe("feedback_ready");
    expect(state.userTurnCount).toBe(1);
    expect(state.session.turns).toHaveLength(1);
    expect(state.session.turns[0]).toMatchObject({
      id: "turn-2",
      speakerId: "user",
      speakerRole: "user",
      text: "I am a product-minded engineer.",
      startedAt: "2026-05-01T00:00:05.000Z",
    });
  });

  it("continues to interviewer processing when turn budget remains", () => {
    const base = createInterviewSession({ maxUserTurns: 2 });
    const active: InterviewRuntimeState = {
      ...base,
      phase: "processing_user_answer",
      session: { ...base.session, status: "active" },
    };

    const state = interviewReducer(active, {
      type: "USER_TURN_ADDED",
      turnId: "turn-2",
      text: "I led a product launch.",
      at: "2026-05-01T00:00:05.000Z",
    });

    expect(state.phase).toBe("processing_interviewer");
    expect(state.userTurnCount).toBe(1);
  });

  it("ends early into feedback-ready", () => {
    const active = {
      ...createInterviewSession(),
      phase: "ready_for_user" as const,
    };

    const ended = interviewReducer(active, { type: "END_EARLY" });

    expect(ended.phase).toBe("feedback_ready");
  });

  it("does not append a partial answer when processing fails", () => {
    const initial = {
      ...createInterviewSession(),
      phase: "processing_user_answer" as const,
    };

    const failed = interviewReducer(initial, {
      type: "USER_ANSWER_FAILED",
      message: "Speech understanding failed.",
    });

    expect(failed.phase).toBe("failed");
    expect(failed.session.status).toBe("failed");
    expect(failed.session.turns).toHaveLength(0);
    expect(failed.error).toBe("Speech understanding failed.");
  });

  it("resets a recoverable error back to ready for user", () => {
    const failed = interviewReducer(createInterviewSession(), {
      type: "USER_ANSWER_FAILED",
      message: "Speech understanding failed.",
    });

    const reset = interviewReducer(failed, { type: "RESET_ERROR" });

    expect(reset.phase).toBe("ready_for_user");
    expect(reset.error).toBeUndefined();
  });
});
