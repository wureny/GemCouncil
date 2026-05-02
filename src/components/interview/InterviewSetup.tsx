"use client";

import { useState } from "react";
import type { InterviewSetup as InterviewSetupData } from "@/domain/session";

export function InterviewSetup({ onStart }: { onStart: (setup: Partial<InterviewSetupData>) => void }) {
  const [goal, setGoal] = useState("General English interview");
  const [targetContext, setTargetContext] = useState("");
  const [selfIntroduction, setSelfIntroduction] = useState("");
  const [style, setStyle] = useState<InterviewSetupData["style"]>("random");
  const [difficulty, setDifficulty] = useState<InterviewSetupData["difficulty"]>("auto");

  return (
    <section className="border border-ink/15 bg-white p-6">
      <h2 className="text-2xl font-semibold">Interview setup</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Goal
          <input className="border border-ink/20 px-3 py-2" value={goal} onChange={(event) => setGoal(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Target context
          <input
            className="border border-ink/20 px-3 py-2"
            value={targetContext}
            onChange={(event) => setTargetContext(event.target.value)}
            placeholder="Role, school, or situation"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Self introduction
          <textarea
            className="min-h-24 border border-ink/20 px-3 py-2"
            value={selfIntroduction}
            onChange={(event) => setSelfIntroduction(event.target.value)}
            placeholder="A few notes about you"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Style
          <select className="border border-ink/20 px-3 py-2" value={style} onChange={(event) => setStyle(event.target.value as InterviewSetupData["style"])}>
            <option value="random">Random</option>
            <option value="friendly">Friendly</option>
            <option value="standard">Standard</option>
            <option value="tough">Tough</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Difficulty
          <select className="border border-ink/20 px-3 py-2" value={difficulty} onChange={(event) => setDifficulty(event.target.value as InterviewSetupData["difficulty"])}>
            <option value="auto">Auto</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </label>
      </div>
      <button
        className="mt-6 w-full border border-ink bg-ink px-4 py-3 text-left font-semibold text-white transition hover:bg-moss"
        onClick={() => onStart({ goal, targetContext, selfIntroduction, style, difficulty })}
      >
        Start mock interview
      </button>
    </section>
  );
}
