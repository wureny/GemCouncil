# Add Interview Room MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real Interview Mode practice loop with setup, turn-based voice interaction, chunked speech processing, AI interviewer responses, and structured feedback.

**Architecture:** Extend the existing Next.js foundation with focused domain modules for interview state, audio chunking, transcript stitching, mock providers, and feedback validation. Keep external model/audio services behind provider interfaces; v0 must run end-to-end with deterministic mock providers while leaving a clean path for Gemma/Gemini provider integration.

**Tech Stack:** Next.js App Router, TypeScript, React, Vitest, Testing Library, existing provider interfaces, browser MediaRecorder.

---

## Subagent Ownership Model

Use subagents for implementation. Each worker must own a disjoint write set:

- Worker A: domain state and orchestration only.
- Worker B: audio chunking and transcript stitching only.
- Worker C: mock providers and provider route adapters only.
- Worker D: UI components and app route composition only.
- Worker E: feedback validation and report rendering only.

All workers must treat `src/domain/session.ts` and `src/domain/providers.ts` as shared contracts. If a contract change is required, stop and ask the parent agent to coordinate it before editing.

## File Structure

Create or modify these files:

- Create: `src/interview/interview-session.ts` - interview state reducer, events, and turn budget logic.
- Create: `src/interview/interview-session.test.ts` - state transition tests.
- Create: `src/interview/interviewer.ts` - interviewer prompt construction and mock interviewer response logic.
- Create: `src/interview/interviewer.test.ts` - interviewer response tests.
- Create: `src/audio/chunking.ts` - model-safe audio chunk planning.
- Create: `src/audio/chunking.test.ts` - chunk planning tests.
- Create: `src/audio/transcript-stitching.ts` - transcript consolidation for chunk results.
- Create: `src/audio/transcript-stitching.test.ts` - overlap and failure tests.
- Create: `src/providers/mock-providers.ts` - deterministic speech/model/TTS mock providers.
- Create: `src/providers/mock-providers.test.ts` - mock provider contract tests.
- Create: `src/feedback/interview-feedback.ts` - feedback validation and mock feedback generation.
- Create: `src/feedback/interview-feedback.test.ts` - feedback schema tests.
- Create: `src/components/interview/InterviewSetup.tsx` - setup form.
- Create: `src/components/interview/InterviewRoom.tsx` - active session UI.
- Create: `src/components/interview/FeedbackReport.tsx` - feedback report UI.
- Create: `src/components/interview/InterviewExperience.tsx` - client-side composition for mock end-to-end flow.
- Modify: `src/app/page.tsx` - render Interview MVP entry path.
- Modify: `openspec/changes/add-interview-room-mvp/tasks.md` - check off tasks after implementation.
- Modify: `README.md` - document mock Interview Mode status and verification.

## Task 1: Interview Session State

**Owner:** Worker A.

**Files:**

- Create: `src/interview/interview-session.ts`
- Create: `src/interview/interview-session.test.ts`

- [ ] **Step 1: Write failing reducer tests**

Create `src/interview/interview-session.test.ts`:

```ts
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
    expect(state.session.setup).toMatchObject({ style: "random", difficulty: "auto" });
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
    expect(started.session.turns[0]?.speakerRole).toBe("interviewer");
  });

  it("marks feedback-ready when the turn budget is reached", () => {
    let state: InterviewRuntimeState = {
      ...createInterviewSession({ maxUserTurns: 1 }),
      phase: "ready_for_user",
      session: { ...createInterviewSession().session, status: "active" },
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
    expect(failed.session.turns).toHaveLength(0);
    expect(failed.error).toBe("Speech understanding failed.");
  });
});
```

- [ ] **Step 2: Run reducer test to verify failure**

Run: `npm run test -- src/interview/interview-session.test.ts`

Expected: FAIL because `src/interview/interview-session.ts` does not exist.

- [ ] **Step 3: Implement interview session reducer**

Create `src/interview/interview-session.ts`:

```ts
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
    phase: "setup",
    maxUserTurns: options?.maxUserTurns ?? 5,
    userTurnCount: 0,
    session: {
      id: crypto.randomUUID(),
      mode: "interview",
      status: "setup",
      createdAt: options?.now ?? new Date().toISOString(),
      setup,
      turns: [],
    },
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
        endedAt: event.at,
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
      return { ...state, phase: "listening", error: undefined };
    case "STOP_LISTENING":
      return { ...state, phase: "processing_user_answer", error: undefined };
    case "USER_TURN_ADDED": {
      const nextUserTurnCount = state.userTurnCount + 1;
      const turn: ConversationTurn = {
        id: event.turnId,
        speakerId: "user",
        speakerRole: "user",
        text: event.text,
        startedAt: event.at,
        endedAt: event.at,
      };

      return {
        ...state,
        userTurnCount: nextUserTurnCount,
        phase:
          nextUserTurnCount >= state.maxUserTurns ? "feedback_ready" : "processing_interviewer",
        session: {
          ...state.session,
          status: "active",
          turns: [...state.session.turns, turn],
        },
      };
    }
    case "END_EARLY":
      return { ...state, phase: "feedback_ready" };
    case "USER_ANSWER_FAILED":
      return {
        ...state,
        phase: "failed",
        error: event.message,
        session: { ...state.session, status: "failed" },
      };
    case "RESET_ERROR":
      return { ...state, phase: "ready_for_user", error: undefined };
  }
}
```

- [ ] **Step 4: Run reducer test to verify pass**

Run: `npm run test -- src/interview/interview-session.test.ts`

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit interview state**

```bash
git add src/interview/interview-session.ts src/interview/interview-session.test.ts
git commit -m "feat: add interview session state"
```

## Task 2: Audio Chunking and Transcript Stitching

**Owner:** Worker B.

**Files:**

- Create: `src/audio/chunking.ts`
- Create: `src/audio/chunking.test.ts`
- Create: `src/audio/transcript-stitching.ts`
- Create: `src/audio/transcript-stitching.test.ts`

- [ ] **Step 1: Write failing chunking tests**

Create `src/audio/chunking.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { planAudioChunks } from "./chunking";

describe("planAudioChunks", () => {
  it("keeps a short answer in one chunk", () => {
    expect(planAudioChunks({ durationMs: 12_000 })).toEqual([
      { index: 0, startMs: 0, endMs: 12_000 },
    ]);
  });

  it("splits long answers without exceeding 30 seconds", () => {
    const chunks = planAudioChunks({ durationMs: 65_000, maxChunkMs: 25_000, overlapMs: 1_000 });

    expect(chunks).toEqual([
      { index: 0, startMs: 0, endMs: 25_000 },
      { index: 1, startMs: 24_000, endMs: 49_000 },
      { index: 2, startMs: 48_000, endMs: 65_000 },
    ]);
    expect(chunks.every((chunk) => chunk.endMs - chunk.startMs <= 30_000)).toBe(true);
  });

  it("rejects unsafe chunk configuration", () => {
    expect(() => planAudioChunks({ durationMs: 65_000, maxChunkMs: 31_000 })).toThrow(
      "maxChunkMs must not exceed 30000",
    );
  });
});
```

- [ ] **Step 2: Implement chunk planning**

Create `src/audio/chunking.ts`:

```ts
export interface AudioChunkPlanInput {
  durationMs: number;
  maxChunkMs?: number;
  overlapMs?: number;
}

export interface AudioChunkPlan {
  index: number;
  startMs: number;
  endMs: number;
}

const GEMMA_AUDIO_LIMIT_MS = 30_000;
const DEFAULT_CHUNK_MS = 25_000;
const DEFAULT_OVERLAP_MS = 1_000;

export function planAudioChunks(input: AudioChunkPlanInput): AudioChunkPlan[] {
  const maxChunkMs = input.maxChunkMs ?? DEFAULT_CHUNK_MS;
  const overlapMs = input.overlapMs ?? DEFAULT_OVERLAP_MS;

  if (maxChunkMs > GEMMA_AUDIO_LIMIT_MS) {
    throw new Error("maxChunkMs must not exceed 30000");
  }
  if (input.durationMs <= 0) {
    return [];
  }
  if (overlapMs >= maxChunkMs) {
    throw new Error("overlapMs must be smaller than maxChunkMs");
  }

  const chunks: AudioChunkPlan[] = [];
  let startMs = 0;

  while (startMs < input.durationMs) {
    const endMs = Math.min(startMs + maxChunkMs, input.durationMs);
    chunks.push({ index: chunks.length, startMs, endMs });
    if (endMs === input.durationMs) break;
    startMs = endMs - overlapMs;
  }

  return chunks;
}
```

- [ ] **Step 3: Write failing transcript stitching tests**

Create `src/audio/transcript-stitching.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { stitchChunkTranscripts } from "./transcript-stitching";

describe("stitchChunkTranscripts", () => {
  it("combines chunk transcripts into one answer", () => {
    expect(
      stitchChunkTranscripts([
        { index: 0, transcript: "I worked on a backend migration" },
        { index: 1, transcript: "and improved system reliability." },
      ]),
    ).toBe("I worked on a backend migration and improved system reliability.");
  });

  it("removes simple overlap duplication", () => {
    expect(
      stitchChunkTranscripts([
        { index: 0, transcript: "I led the project and worked with design" },
        { index: 1, transcript: "worked with design to launch the beta" },
      ]),
    ).toBe("I led the project and worked with design to launch the beta");
  });

  it("throws when a chunk failed", () => {
    expect(() =>
      stitchChunkTranscripts([
        { index: 0, transcript: "I started answering" },
        { index: 1, transcript: "", error: "provider failed" },
      ]),
    ).toThrow("Cannot stitch failed chunk 1: provider failed");
  });
});
```

- [ ] **Step 4: Implement transcript stitching**

Create `src/audio/transcript-stitching.ts`:

```ts
export interface ChunkTranscript {
  index: number;
  transcript: string;
  error?: string;
}

export function stitchChunkTranscripts(chunks: ChunkTranscript[]): string {
  const sorted = [...chunks].sort((a, b) => a.index - b.index);
  let result = "";

  for (const chunk of sorted) {
    if (chunk.error) {
      throw new Error(`Cannot stitch failed chunk ${chunk.index}: ${chunk.error}`);
    }

    const clean = normalizeWhitespace(chunk.transcript);
    if (!clean) continue;

    result = result ? mergeWithOverlap(result, clean) : clean;
  }

  return result;
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function mergeWithOverlap(left: string, right: string): string {
  const leftWords = left.split(" ");
  const rightWords = right.split(" ");
  const maxOverlap = Math.min(leftWords.length, rightWords.length, 8);

  for (let size = maxOverlap; size > 0; size -= 1) {
    const leftTail = leftWords.slice(-size).join(" ").toLowerCase();
    const rightHead = rightWords.slice(0, size).join(" ").toLowerCase();
    if (leftTail === rightHead) {
      return [...leftWords, ...rightWords.slice(size)].join(" ");
    }
  }

  return `${left} ${right}`;
}
```

- [ ] **Step 5: Run audio tests**

Run: `npm run test -- src/audio`

Expected: PASS, 6 tests.

- [ ] **Step 6: Commit audio utilities**

```bash
git add src/audio/chunking.ts src/audio/chunking.test.ts src/audio/transcript-stitching.ts src/audio/transcript-stitching.test.ts
git commit -m "feat: add chunked speech utilities"
```

## Task 3: Mock Providers and Interviewer Logic

**Owner:** Worker C.

**Files:**

- Create: `src/providers/mock-providers.ts`
- Create: `src/providers/mock-providers.test.ts`
- Create: `src/interview/interviewer.ts`
- Create: `src/interview/interviewer.test.ts`

- [ ] **Step 1: Write mock provider tests**

Create tests proving mock providers satisfy `SpeechUnderstandingProvider`, `SpeechOutputProvider`, `ModelReasoningProvider`, and `ContextProvider`. Use deterministic responses so UI smoke tests can rely on exact text.

Run: `npm run test -- src/providers/mock-providers.test.ts`

Expected: FAIL because implementation does not exist.

- [ ] **Step 2: Implement mock providers**

Create `src/providers/mock-providers.ts` exporting:

```ts
import type {
  AudioInput,
  AudioOutput,
  ContextProvider,
  ContextResult,
  ModelMessage,
  ModelReasoningProvider,
  ModelResponse,
  SpeechOutputProvider,
  SpeechUnderstanding,
  SpeechUnderstandingProvider,
  VoiceProfile,
} from "@/domain/providers";
import type { PracticeSession } from "@/domain/session";

export class MockSpeechUnderstandingProvider implements SpeechUnderstandingProvider {
  async understand(input: AudioInput): Promise<SpeechUnderstanding> {
    return {
      transcript: `Mock transcript for ${input.durationMs}ms answer.`,
      confidence: 1,
      language: "en",
    };
  }
}

export class MockSpeechOutputProvider implements SpeechOutputProvider {
  async speak(text: string, voice: VoiceProfile): Promise<AudioOutput> {
    return {
      url: `data:audio/mock,${encodeURIComponent(`${voice.id}:${text}`)}`,
      mimeType: "audio/mock",
      durationMs: Math.max(800, text.length * 35),
    };
  }
}

export class MockModelReasoningProvider implements ModelReasoningProvider {
  async generate(messages: ModelMessage[]): Promise<ModelResponse> {
    const last = messages.at(-1)?.content ?? "";
    return { text: `Mock interviewer response: ${last}` };
  }
}

export class MockContextProvider implements ContextProvider {
  async getContext(): Promise<ContextResult> {
    return {
      title: "General English interview",
      prompts: [
        "Tell me about yourself.",
        "Describe a challenge you handled well.",
        "What would you like to improve next?",
      ],
      source: "built-in",
    };
  }
}

export function createMockProviderSet() {
  return {
    speechUnderstanding: new MockSpeechUnderstandingProvider(),
    speechOutput: new MockSpeechOutputProvider(),
    modelReasoning: new MockModelReasoningProvider(),
    context: new MockContextProvider(),
  };
}
```

- [ ] **Step 3: Write interviewer tests**

Create `src/interview/interviewer.test.ts` to verify the first prompt asks a concise interview question and follow-up generation uses the latest user answer.

Run: `npm run test -- src/interview/interviewer.test.ts`

Expected: FAIL because implementation does not exist.

- [ ] **Step 4: Implement interviewer helpers**

Create `src/interview/interviewer.ts` exporting:

```ts
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
```

- [ ] **Step 5: Run provider and interviewer tests**

Run: `npm run test -- src/providers src/interview/interviewer.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit providers and interviewer logic**

```bash
git add src/providers src/interview/interviewer.ts src/interview/interviewer.test.ts
git commit -m "feat: add mock interview providers"
```

## Task 4: Feedback Validation

**Owner:** Worker E.

**Files:**

- Create: `src/feedback/interview-feedback.ts`
- Create: `src/feedback/interview-feedback.test.ts`

- [ ] **Step 1: Write feedback tests**

Create tests for: no user answers rejected, valid feedback produced from transcript, score bounds enforced.

Run: `npm run test -- src/feedback/interview-feedback.test.ts`

Expected: FAIL because implementation does not exist.

- [ ] **Step 2: Implement feedback validation and mock generation**

Create `src/feedback/interview-feedback.ts` exporting `canGenerateInterviewFeedback`, `createMockInterviewFeedback`, and `assertValidFeedbackReport`. Use the existing `FeedbackReport` type and enforce scores from 1 to 5.

- [ ] **Step 3: Run feedback tests**

Run: `npm run test -- src/feedback/interview-feedback.test.ts`

Expected: PASS.

- [ ] **Step 4: Commit feedback module**

```bash
git add src/feedback/interview-feedback.ts src/feedback/interview-feedback.test.ts
git commit -m "feat: add interview feedback validation"
```

## Task 5: Interview UI Composition

**Owner:** Worker D.

**Files:**

- Create: `src/components/interview/InterviewSetup.tsx`
- Create: `src/components/interview/InterviewRoom.tsx`
- Create: `src/components/interview/FeedbackReport.tsx`
- Create: `src/components/interview/InterviewExperience.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add Interview setup component**

Create `InterviewSetup.tsx` as a client component that accepts setup fields and calls `onStart(setup)` with `InterviewSetup`.

- [ ] **Step 2: Add Interview room component**

Create `InterviewRoom.tsx` that renders current phase, transcript turns, a record/submit mock answer control, and an end session button. For this MVP, the record button may use mock transcript text while the audio pipeline module exists independently.

- [ ] **Step 3: Add Feedback report component**

Create `FeedbackReport.tsx` that renders summary, five score rows, strengths, improvements, better answer examples, and next practice.

- [ ] **Step 4: Add Interview experience composition**

Create `InterviewExperience.tsx` that wires setup, reducer, mock providers, interviewer generation, user answer submission, early ending, and mock feedback generation into one client-side flow.

- [ ] **Step 5: Render Interview MVP on home page**

Modify `src/app/page.tsx` so Interview Room entry renders the mock Interview MVP path while Meeting remains visually present but disabled or marked as later.

- [ ] **Step 6: Run UI verification**

Run: `npm run typecheck && npm run lint && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit UI composition**

```bash
git add src/components/interview src/app/page.tsx
git commit -m "feat: add interview room UI"
```

## Task 6: OpenSpec and Documentation Closeout

**Owner:** Parent agent.

**Files:**

- Modify: `openspec/changes/add-interview-room-mvp/tasks.md`
- Modify: `README.md`

- [ ] **Step 1: Update OpenSpec task checkboxes**

Mark completed tasks in `openspec/changes/add-interview-room-mvp/tasks.md`.

- [ ] **Step 2: Update README**

Document that Interview Mode currently runs on deterministic mock providers and that Gemma/Gemini provider integration is next.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run verify
openspec validate add-interview-room-mvp
```

Expected: both commands pass.

- [ ] **Step 4: Commit closeout docs**

```bash
git add README.md openspec/changes/add-interview-room-mvp/tasks.md
git commit -m "docs: update interview MVP status"
```

## Self-Review Notes

Spec coverage:

- Interview setup maps to Task 1 and Task 5.
- One-on-one interview room maps to Task 1, Task 3, and Task 5.
- Turn budget maps to Task 1.
- Mock provider fallback maps to Task 3 and Task 5.
- Turn-based microphone capture maps to Task 2 and Task 5; the first UI path may use mock answer submission while the chunking module enforces the model-safe design.
- Audio chunking maps to Task 2.
- Transcript stitching maps to Task 2.
- Interviewer speech playback maps to Task 3 and Task 5 through `SpeechOutputProvider`.
- Structured feedback maps to Task 4 and Task 5.

Execution handoff:

Use Subagent-Driven execution. Assign Worker A through E as above, then let the parent agent integrate, run full verification, update OpenSpec task status, and prepare the PR.
