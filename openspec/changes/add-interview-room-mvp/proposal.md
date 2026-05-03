## Why

GemCouncil needs its first real practice loop: a user should be able to complete a general English interview with voice input, AI spoken responses, and structured feedback. This change turns the app foundation into a usable v0 demo path while respecting Gemma 4's short-audio request constraints through chunked speech processing.

For the Gemma 4 hackathon, the product should be framed as a communication equity tool rather than only an interview simulator. The core impact story is that non-native English speakers need realistic, private, affordable spoken practice before high-stakes interviews and meetings. Gemma-powered speech understanding, explicit interviewer actions, and evidence-based feedback make that practice more accessible and trustworthy.

## What Changes

- Add Interview Mode setup for general English interview practice.
- Add a one-on-one interview room with a single AI interviewer and turn-based session state.
- Add chunked speech input processing so user answers can exceed the model's per-request audio limit.
- Add model-backed interviewer response generation with a deterministic mock provider fallback for development and tests.
- Add speech output playback for interviewer questions and follow-ups through the existing provider boundary.
- Add structured interview feedback at the end of a session.
- Keep the roadmap pointed toward scenario-grounded practice, function-call-style interviewer actions, and evidence-backed feedback.
- Do not add Meeting Mode behavior in this change.
- Do not add cloud account history in this change.

## Capabilities

### New Capabilities

- `interview-room`: Covers interview setup, active interview session flow, interviewer turns, user turns, and session completion.
- `chunked-speech-interaction`: Covers microphone capture, audio chunking, speech understanding, transcript stitching, and speech output playback for turn-based voice interaction.
- `interview-feedback`: Covers structured post-session feedback for completed interview sessions.

### Modified Capabilities

None.

## Impact

- Affected code: Next.js app routes/pages/components, domain session types, interview orchestration modules, provider implementations, tests, and README usage notes.
- Affected APIs: client-side recording interfaces, internal route handlers for speech/model operations, and provider contracts for speech understanding, model reasoning, and speech output.
- Affected dependencies: possible browser recording utilities, schema validation utilities, and optional provider SDKs.
- Affected systems: local development workflow, mock provider test flow, future Gemma/Gemini provider integration, and deployed Vercel app behavior.
