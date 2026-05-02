"use client";

import type { InterviewRuntimeState } from "@/interview/interview-session";

export function InterviewRoom({
  state,
  recordingError,
  onStartRecording,
  onStopRecording,
  onSubmitAnswer,
  onReplayInterviewer,
  onEnd,
}: {
  state: InterviewRuntimeState;
  recordingError?: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitAnswer: () => void;
  onReplayInterviewer: () => void;
  onEnd: () => void;
}) {
  const canAnswer = state.phase === "ready_for_user";
  const isListening = state.phase === "listening";
  const isSpeaking = state.phase === "speaking";
  const hasInterviewerAudio = state.session.turns.some((turn) => turn.speakerRole === "interviewer" && turn.audioUrl);

  return (
    <section className="border border-ink/15 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Interview room</h2>
          <p className="mt-1 text-sm font-medium text-signal">{state.phase.replaceAll("_", " ")}</p>
        </div>
        <button className="border border-ink px-4 py-2 font-semibold hover:bg-ink hover:text-white" onClick={onEnd}>
          End session
        </button>
      </div>

      <div className="mt-6 max-h-96 space-y-3 overflow-y-auto border border-ink/10 bg-paper p-4">
        {state.session.turns.map((turn) => (
          <article key={turn.id} className="bg-white p-4">
            <p className="text-xs font-semibold uppercase text-moss">{turn.speakerRole}</p>
            <p className="mt-2 leading-7 text-slate">{turn.text}</p>
          </article>
        ))}
      </div>

      {recordingError ? (
        <p className="mt-4 border border-signal/40 bg-signal/10 p-3 text-sm text-signal">
          {recordingError}
        </p>
      ) : null}
      {state.error ? (
        <p className="mt-4 border border-signal/40 bg-signal/10 p-3 text-sm text-signal">
          {state.error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <button
          className="border border-ink bg-ink px-4 py-3 text-left font-semibold text-white transition enabled:hover:bg-moss disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canAnswer}
          onClick={onStartRecording}
        >
          Start recording
        </button>
        <button
          className="border border-ink px-4 py-3 text-left font-semibold transition enabled:hover:bg-ink enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!isListening}
          onClick={onStopRecording}
        >
          Stop and submit
        </button>
        <button
          className="border border-ink/40 px-4 py-3 text-left font-semibold text-slate transition enabled:hover:border-ink enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canAnswer}
          onClick={onSubmitAnswer}
        >
          Use mock answer
        </button>
        <button
          className="border border-ink/40 px-4 py-3 text-left font-semibold text-slate transition enabled:hover:border-ink enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isSpeaking || !hasInterviewerAudio}
          onClick={onReplayInterviewer}
        >
          Replay interviewer
        </button>
      </div>
    </section>
  );
}
