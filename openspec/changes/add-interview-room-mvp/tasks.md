## 1. Interview Setup and Room UI

- [x] 1.1 Add Interview Mode setup controls for goal, target context, self-introduction, background notes, style, and difficulty.
- [x] 1.2 Add an active interview room view with interviewer status, transcript, mock answer controls, and session controls.
- [ ] 1.3 Add full UI states for idle, listening, processing, speaking, feedback-ready, completed, and failed.

## 2. Interview State and Orchestration

- [x] 2.1 Add interview session state management with setup, active, feedback-ready, completed, and failed states.
- [x] 2.2 Add interviewer turn generation through a model reasoning provider with deterministic mock fallback.
- [x] 2.3 Add turn budget handling and early session ending.
- [x] 2.4 Add interviewer policy decisions for proactive openings, targeted follow-ups, and next-question progression.
- [ ] 2.5 Add scenario packs for grounded interview plans and rubrics.
- [ ] 2.6 Upgrade interviewer policy decisions into function-call-style action objects.

## 3. Chunked Speech Interaction

- [x] 3.1 Add browser microphone capture for turn-based user answers.
- [x] 3.2 Add audio chunk planning so no Gemma audio understanding request exceeds 30 seconds.
- [x] 3.3 Add transcript stitching from one or more chunk understanding results into one user turn.
- [x] 3.4 Add recoverable error states for microphone permission, chunk processing, and speech understanding failures.
- [x] 3.5 Add Gemma speech understanding provider toggle, Next.js route proxy, and Python FastAPI service scaffold.
- [x] 3.6 Add remote provider API key, timeout, health check, and deployment documentation.

## 4. Speech Output

- [x] 4.1 Add speech output provider route or adapter for interviewer responses.
- [x] 4.2 Add audio playback controls for generated interviewer speech.
- [x] 4.3 Add text fallback visibility through transcript-first interviewer responses.
- [x] 4.4 Add VoxCPM speech output provider toggle, Next.js route proxy, and Python FastAPI service scaffold.

## 5. Feedback

- [x] 5.1 Add structured feedback generation using interview setup and consolidated transcript.
- [x] 5.2 Validate feedback score dimensions and report arrays before rendering.
- [x] 5.3 Add feedback report UI with summary, five scores, strengths, improvements, better answer examples, and next practice.
- [ ] 5.4 Add evidence-backed score rationales with concise transcript snippets.

## 6. Verification

- [x] 6.1 Add unit tests for interview state transitions and turn budget behavior.
- [x] 6.2 Add unit tests for chunk planning and transcript stitching.
- [x] 6.3 Add unit tests for feedback report validation.
- [ ] 6.4 Add a UI smoke test or component test for the setup-to-feedback mock provider path.
- [x] 6.5 Run `npm run verify` and `openspec validate add-interview-room-mvp`.
