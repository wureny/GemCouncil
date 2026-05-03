## Context

GemCouncil now has a Next.js app foundation, shared session contracts, provider interfaces, CI, and stable OpenSpec baseline. The next product step is the first real v0 practice loop: Interview Mode.

Gemma 4 audio understanding is useful for short audio clips, but it has a per-request audio duration limit. The product must not expose that model constraint as a user-facing limit. Instead, the interview flow should be turn-based and process a user's answer as one or more short audio chunks that are stitched into a single transcript turn.

## Goals / Non-Goals

**Goals:**

- Add a usable general English Interview Mode.
- Support one AI interviewer and one user.
- Support turn-based microphone recording for user answers.
- Process long user answers through chunked audio understanding so no Gemma audio request exceeds 30 seconds.
- Produce interviewer questions, follow-ups, and closing behavior through provider-backed orchestration.
- Generate structured feedback using the final transcript and setup context.
- Keep deterministic mock providers available for development, tests, and demo recovery.

**Non-Goals:**

- Meeting Mode implementation.
- User accounts or cloud-synced history.
- Real-time overlapping speech.
- Full streaming ASR.
- Pronunciation phoneme analysis.
- Sentence-by-sentence grammar correction.
- Live search as a required dependency.

## Decisions

### Decision: Use turn-based voice instead of free-running realtime conversation

The v0 interview uses explicit user turns: the interviewer speaks, the user records an answer, the system processes it, then the interviewer responds.

Rationale: turn-based interaction matches interview practice, keeps state predictable, and makes audio chunking reliable. It also avoids pretending that Gemma's short audio request path is a full realtime meeting engine.

Alternative considered: continuous realtime conversation. This would feel more natural but would require streaming ASR, interruption handling, and substantially more latency engineering.

### Decision: Chunk user answers internally

The app treats a user answer as one logical turn while splitting the underlying audio into model-safe chunks. No chunk sent to Gemma audio understanding may exceed 30 seconds.

Rationale: this preserves the user experience while respecting the model's per-request audio limit. It also makes the transcript the durable context object rather than long raw audio.

Alternative considered: cap user answers at 30 seconds. That would simplify implementation but would be a poor product experience and would train users around an artificial constraint.

### Decision: Store transcript turns as the agent context

The interviewer and feedback evaluator use consolidated transcript turns plus setup context as their primary context. Raw audio chunks are transient processing artifacts.

Rationale: transcripts are cheaper, easier to test, easier to validate, and better suited to feedback generation than replaying raw audio into every model call.

Alternative considered: keep raw audio as the primary session context. This would be expensive, harder to inspect, and brittle across provider choices.

### Decision: Use a separate Gemma speech service

The Next.js app calls an internal speech understanding route, and that route forwards model-safe audio chunks to a separate Python FastAPI service running Gemma 3n. The browser never calls the Gemma service directly.

Rationale: Gemma speech understanding needs Python, Hugging Face Transformers, model weights, and usually a GPU runtime. Keeping that outside Vercel and behind the `SpeechUnderstandingProvider` boundary lets the frontend keep using mock speech understanding when the service is unavailable.

Alternative considered: load Gemma from the Next.js app. That would couple the web app to heavy model dependencies and would not fit Vercel-style deployment.

### Decision: Keep interviewer initiative in system policy

The interviewer's proactive behavior is controlled by application policy before model generation. The policy decides whether the next turn is an opening question, a targeted follow-up, or a new question; the model provider then writes the actual interviewer wording under those constraints.

Rationale: realistic interviews require the interviewer to manage the conversation, but leaving all initiative to the model would make turn-taking, feedback timing, and future TTS playback harder to control.

Alternative considered: let the LLM freely decide the next action from transcript history. That could feel more flexible, but it would make demos less deterministic and would blur the boundary between product orchestration and language generation.

### Decision: Implement mock providers alongside real provider boundaries

The MVP should include deterministic mock implementations for speech understanding, speech output, and interviewer reasoning.

Rationale: mocks let UI, orchestration, tests, and demos proceed even before the Gemma/Gemini provider path is fully configured. They also give subagents a stable target while provider integration evolves.

Alternative considered: block all implementation on real providers. That would increase risk and slow parallel development.

### Decision: Keep feedback structured and bounded

Feedback uses the existing five scoring dimensions and structured report shape from the foundation. Scores must be bounded and validated before rendering.

Rationale: structured feedback is easier to test, easier to render, and aligns with the product positioning as a communication practice tool rather than a generic chat app.

Alternative considered: free-form feedback only. That would be faster but less product-like and harder to compare across sessions.

## Risks / Trade-offs

- [Risk] Chunk stitching can duplicate or drop words around boundaries. → Mitigation: use short overlap and transcript consolidation, and keep the final transcript editable or retryable in later changes if needed.
- [Risk] Provider latency may make voice interaction feel slow. → Mitigation: keep turn-based UX states explicit: listening, processing, speaking, and ready.
- [Risk] Mock providers can hide real provider failures. → Mitigation: keep provider mode visible in development and add tests around provider error states.
- [Risk] The first Interview MVP may look text-heavy. → Mitigation: make speech playback and recording states first-class while keeping transcript visible as support.
- [Risk] Audio provider choices may change after experimentation with Hugging Face, Google AI, or external TTS. → Mitigation: keep integration behind provider interfaces and avoid coupling UI to one provider.

## Migration Plan

1. Add interview setup and interview room UI.
2. Add interview session reducer/state machine using existing contracts.
3. Add mock provider implementations.
4. Add microphone recording and chunk planning.
5. Add speech understanding route/provider flow.
6. Add interviewer response generation route/provider flow.
7. Add speech output route/provider flow.
8. Add feedback report generation and rendering.
9. Add tests for state transitions, chunking, provider errors, and feedback schema.

Rollback: revert this change before later Meeting or local history changes depend on the Interview Mode routes and modules. No cloud data migration is involved.
