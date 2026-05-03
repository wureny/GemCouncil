"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { understandRecordedAnswer } from "@/audio/recorded-answer";
import { playSpeechOutput } from "@/audio/speech-playback";
import type { AudioOutput } from "@/domain/providers";
import type { FeedbackReport as FeedbackReportData, InterviewSetup as InterviewSetupData } from "@/domain/session";
import { createMockInterviewFeedback } from "@/feedback/interview-feedback";
import { createInterviewSession, interviewReducer, type InterviewRuntimeState } from "@/interview/interview-session";
import { generateInterviewerResponse } from "@/interview/interviewer";
import { createInterviewProviderSet } from "@/providers/provider-set";
import { FeedbackReport } from "./FeedbackReport";
import { InterviewRoom } from "./InterviewRoom";
import { InterviewSetup } from "./InterviewSetup";

export function InterviewExperience() {
  const providers = useMemo(() => createInterviewProviderSet(), []);
  const [state, setState] = useState<InterviewRuntimeState>(() => createInterviewSession());
  const [report, setReport] = useState<FeedbackReportData | null>(null);
  const [latestSpeech, setLatestSpeech] = useState<AudioOutput | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const stateRef = useRef(state);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordingStartedAtRef = useRef<number>(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (state.phase !== "speaking" || !latestSpeech) {
      return;
    }

    const playback = playSpeechOutput(latestSpeech);
    let cancelled = false;

    void playback.done
      .then(() => {
        if (!cancelled) {
          setState((current) => interviewReducer(current, { type: "INTERVIEWER_SPEECH_FINISHED" }));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Interviewer speech playback failed.";
          setState((current) =>
            interviewReducer(current, {
              type: "INTERVIEWER_SPEECH_FAILED",
              message,
            }),
          );
        }
      });

    return () => {
      cancelled = true;
      playback.stop();
    };
  }, [latestSpeech, state.phase]);

  async function startInterview(setup: Partial<InterviewSetupData>) {
    const next = createInterviewSession({ setup });
    const response = await generateInterviewerResponse(providers.modelReasoning, next.session);
    const speech = await providers.speechOutput.speak(response.text, {
      id: "interviewer-default",
      label: "Interviewer",
    });
    setLatestSpeech(speech);

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

  async function continueAfterUserAnswer(answerText: string) {
    const currentState = stateRef.current;
    const withAnswer = interviewReducer(currentState, {
      type: "USER_TURN_ADDED",
      turnId: crypto.randomUUID(),
      text: answerText,
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
    setLatestSpeech(speech);

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

  async function submitMockAnswer() {
    await continueAfterUserAnswer(
      "I want to practice answering clearly under pressure, especially giving concrete examples in English.",
    );
  }

  function replayInterviewerSpeech() {
    if (latestSpeech) {
      setState((current) => interviewReducer(current, { type: "INTERVIEWER_SPEECH_STARTED" }));
    }
  }

  async function startRecording() {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recordingStartedAtRef.current = performance.now();

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });
      recorder.addEventListener("stop", () => {
        void processRecording(recorder.mimeType || "audio/webm");
      });

      recorder.start();
      setState((current) => interviewReducer(current, { type: "START_LISTENING" }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Microphone permission was denied.";
      setRecordingError(message);
      setState((current) =>
        interviewReducer(current, {
          type: "USER_ANSWER_FAILED",
          message,
        }),
      );
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      setState((current) => interviewReducer(current, { type: "STOP_LISTENING" }));
      recorderRef.current.stop();
    }
  }

  async function processRecording(mimeType: string) {
    const durationMs = Math.max(1, Math.round(performance.now() - recordingStartedAtRef.current));
    const audio = new Blob(chunksRef.current, { type: mimeType });
    cleanupRecording();

    try {
      const transcript = await understandRecordedAnswer({
        audio,
        durationMs,
        mimeType,
        session: stateRef.current.session,
        speechUnderstanding: providers.speechUnderstanding,
      });
      await continueAfterUserAnswer(transcript);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Speech understanding failed.";
      setRecordingError(message);
      setState((current) => interviewReducer(current, { type: "USER_ANSWER_FAILED", message }));
    }
  }

  function cleanupRecording() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
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
        <InterviewRoom
          state={state}
          recordingError={recordingError}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onSubmitAnswer={submitMockAnswer}
          onReplayInterviewer={replayInterviewerSpeech}
          onEnd={endSession}
        />
      )}
      {report ? <FeedbackReport report={report} /> : null}
    </div>
  );
}
