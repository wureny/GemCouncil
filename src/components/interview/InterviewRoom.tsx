"use client";

import type { InterviewRuntimeState } from "@/interview/interview-session";

export function InterviewRoom({
  state,
  onSubmitAnswer,
  onEnd,
}: {
  state: InterviewRuntimeState;
  onSubmitAnswer: () => void;
  onEnd: () => void;
}) {
  const canAnswer = state.phase === "ready_for_user";

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

      <button
        className="mt-6 w-full border border-ink bg-ink px-4 py-3 text-left font-semibold text-white transition enabled:hover:bg-moss disabled:cursor-not-allowed disabled:opacity-45"
        disabled={!canAnswer}
        onClick={onSubmitAnswer}
      >
        Submit mock spoken answer
      </button>
    </section>
  );
}
