"use client";

import { useMemo, useState } from "react";
import type { FeedbackReport as FeedbackReportData, InterviewSetup as InterviewSetupData } from "@/domain/session";
import { createMockInterviewFeedback } from "@/feedback/interview-feedback";
import { createInterviewSession, interviewReducer, type InterviewRuntimeState } from "@/interview/interview-session";
import { generateInterviewerResponse } from "@/interview/interviewer";
import { createMockProviderSet } from "@/providers/mock-providers";
import { FeedbackReport } from "./FeedbackReport";
import { InterviewRoom } from "./InterviewRoom";
import { InterviewSetup } from "./InterviewSetup";

export function InterviewExperience() {
  const providers = useMemo(() => createMockProviderSet(), []);
  const [state, setState] = useState<InterviewRuntimeState>(() => createInterviewSession());
  const [report, setReport] = useState<FeedbackReportData | null>(null);

  async function startInterview(setup: Partial<InterviewSetupData>) {
    const next = createInterviewSession({ setup });
    const response = await generateInterviewerResponse(providers.modelReasoning, next.session);
    const speech = await providers.speechOutput.speak(response.text, {
      id: "interviewer-default",
      label: "Interviewer",
    });

    setState(
      interviewReducer(next, {
        type: "INTERVIEWER_TURN_ADDED",
        turnId: crypto.randomUUID(),
        text: response.text,
        audioUrl: speech.url,
        at: new Date().toISOString(),
      }),
    );
    setReport(null);
  }

  async function submitMockAnswer() {
    const withAnswer = interviewReducer(state, {
      type: "USER_TURN_ADDED",
      turnId: crypto.randomUUID(),
      text: "I want to practice answering clearly under pressure, especially giving concrete examples in English.",
      at: new Date().toISOString(),
    });

    if (withAnswer.phase === "feedback_ready") {
      setState(withAnswer);
      setReport(createMockInterviewFeedback(withAnswer.session));
      return;
    }

    const response = await generateInterviewerResponse(providers.modelReasoning, withAnswer.session);
    const speech = await providers.speechOutput.speak(response.text, {
      id: "interviewer-default",
      label: "Interviewer",
    });

    setState(
      interviewReducer(withAnswer, {
        type: "INTERVIEWER_TURN_ADDED",
        turnId: crypto.randomUUID(),
        text: response.text,
        audioUrl: speech.url,
        at: new Date().toISOString(),
      }),
    );
  }

  function endSession() {
    const ended = interviewReducer(state, { type: "END_EARLY" });
    setState(ended);
    if (ended.session.turns.some((turn) => turn.speakerRole === "user")) {
      setReport(createMockInterviewFeedback(ended.session));
    }
  }

  return (
    <div className="grid gap-6">
      {state.phase === "setup" ? (
        <InterviewSetup onStart={startInterview} />
      ) : (
        <InterviewRoom state={state} onSubmitAnswer={submitMockAnswer} onEnd={endSession} />
      )}
      {report ? <FeedbackReport report={report} /> : null}
    </div>
  );
}
