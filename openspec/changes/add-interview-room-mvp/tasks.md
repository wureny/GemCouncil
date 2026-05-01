## 1. Interview Setup and Room UI

- [ ] 1.1 Add Interview Mode setup controls for goal, target context, self-introduction, background notes, style, and difficulty.
- [ ] 1.2 Add an active interview room view with interviewer status, transcript, recording controls, and session controls.
- [ ] 1.3 Add UI states for idle, listening, processing, speaking, feedback-ready, completed, and failed.

## 2. Interview State and Orchestration

- [ ] 2.1 Add interview session state management with setup, active, feedback-ready, completed, and failed states.
- [ ] 2.2 Add interviewer turn generation through a model reasoning provider with deterministic mock fallback.
- [ ] 2.3 Add turn budget handling and early session ending.

## 3. Chunked Speech Interaction

- [ ] 3.1 Add browser microphone capture for turn-based user answers.
- [ ] 3.2 Add audio chunk planning so no Gemma audio understanding request exceeds 30 seconds.
- [ ] 3.3 Add transcript stitching from one or more chunk understanding results into one user turn.
- [ ] 3.4 Add recoverable error states for microphone permission, chunk processing, speech understanding, and speech playback failures.

## 4. Speech Output

- [ ] 4.1 Add speech output provider route or adapter for interviewer responses.
- [ ] 4.2 Add audio playback controls for generated interviewer speech.
- [ ] 4.3 Add text fallback visibility when speech output fails.

## 5. Feedback

- [ ] 5.1 Add structured feedback generation using interview setup and consolidated transcript.
- [ ] 5.2 Validate feedback score dimensions and report arrays before rendering.
- [ ] 5.3 Add feedback report UI with summary, five scores, strengths, improvements, better answer examples, and next practice.

## 6. Verification

- [ ] 6.1 Add unit tests for interview state transitions and turn budget behavior.
- [ ] 6.2 Add unit tests for chunk planning and transcript stitching.
- [ ] 6.3 Add unit tests for feedback report validation.
- [ ] 6.4 Add a UI smoke test or component test for the setup-to-feedback mock provider path.
- [ ] 6.5 Run `npm run verify` and `openspec validate add-interview-room-mvp`.
