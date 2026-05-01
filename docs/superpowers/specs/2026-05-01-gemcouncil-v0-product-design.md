# GemCouncil v0 Product Design

## Goal

GemCouncil v0 is a real voice-first practice product for non-native English speakers preparing for high-pressure English communication. The first release focuses on two practice modes:

- Interview Mode: a one-on-one general English interview simulation.
- Meeting Mode: a lightweight business meeting simulation with multiple AI participants.

The product must be usable as a deployed web app, not a scripted mock demo. The v0 should prioritize a reliable end-to-end practice loop over broad feature coverage.

## Product Positioning

GemCouncil is not a generic English tutor. It is a pressure-room simulator for people who need to listen, respond, clarify, and explain themselves in English interviews and meetings.

The core promise is:

> Practice the room before you enter the room.

The v0 product should make users feel that they are practicing realistic spoken interaction, not filling out an English exercise worksheet.

## Target User

The initial target user is a non-native English speaker who can read and write English reasonably well but struggles in live English conversations because of listening pressure, response timing, fluency, confidence, or difficulty structuring answers.

Typical use cases:

- Preparing for a general English job interview.
- Practicing behavioral interview answers.
- Rehearsing how to participate in an English business discussion.
- Building confidence before a real meeting or interview.

## v0 Scope

### Interview Mode

Interview Mode is the primary v0 demo path.

The user can start a general English interview practice session by providing optional setup context:

- Interview goal.
- Target role, school, or situation.
- Short self-introduction.
- Resume summary or background notes.
- Preferred interview style.
- Preferred difficulty level.

The system creates one AI interviewer. The interviewer asks questions, listens to the user's spoken answers, asks follow-up questions, and ends the session with structured feedback.

Interview Mode uses one interviewer because that matches common real interviews and keeps voice turn-taking reliable.

### Meeting Mode

Meeting Mode is a real but lightweight secondary v0 path.

The default meeting type is a business meeting. The user enters a meeting topic, and the system creates two or three AI participants with different perspectives. The meeting is moderated so participants take turns rather than speaking freely over each other.

A typical meeting flow:

1. The moderator opens the topic.
2. Participant A gives an initial view.
3. Participant B challenges or reframes the topic.
4. The user responds by voice.
5. Participant C or the moderator asks a clarification question.
6. The meeting continues for a few turns.
7. The system summarizes the discussion and gives the user communication feedback.

Meeting Mode exists in v0 because it supports the GemCouncil product direction, but it must stay narrower than Interview Mode.

### Voice Interaction

v0 targets complete voice input and voice output.

The user should be able to speak answers through the microphone. The AI interviewer or meeting participants should respond with natural speech. Transcripts may be displayed as support material, but they are not the primary interaction.

Fallbacks may exist for development or emergency demo recovery, but the product requirement is real speech-in and speech-out interaction.

### Context Sources

v0 uses a hybrid context strategy:

- Built-in question and prompt bank as the reliable default.
- A `ContextProvider` abstraction so search or retrieval-enhanced context can be added later.

The deployed v0 must work without live search. Search enhancement is allowed only if it does not block the core practice path.

### Local History

v0 does not include accounts, authentication, or cloud history.

The browser stores recent sessions and reports locally so users can review their practice. Users can clear local history.

The product should avoid uploading old session history unless it is explicitly needed for the active model request.

### Feedback Report

After each session, GemCouncil generates structured training feedback.

The report includes:

- Five scoring dimensions:
  - clarity
  - relevance
  - listening
  - fluency
  - confidence
- Strengths.
- Improvement areas.
- Better answer examples.
- Recommended next practice.

The report should evaluate communication performance, not only grammar. v0 should avoid detailed sentence-by-sentence correction because that would shift the product toward an English proofreading tool.

## User Flows

### Interview Flow

1. User opens the web app.
2. User selects Interview Mode.
3. User optionally enters interview goal, background, style, and difficulty.
4. User starts the session.
5. AI interviewer asks the first question by voice.
6. User answers by voice.
7. System transcribes and interprets the answer.
8. AI interviewer asks a follow-up or moves to the next question.
9. User ends the session or the system ends after the configured turn count.
10. System generates a structured feedback report.
11. Session and report are saved to local history.

### Meeting Flow

1. User opens the web app.
2. User selects Meeting Mode.
3. User enters a business discussion topic.
4. System generates participant roles and perspectives.
5. Moderator opens the meeting.
6. Participants speak in a controlled order.
7. User responds by voice when prompted.
8. System continues the moderated discussion for a limited number of turns.
9. System generates a meeting summary and user communication feedback.
10. Session and report are saved to local history.

## Agent Design

### Interview Agents

Interview Mode uses:

- `InterviewOrchestrator`: controls session state, turn count, and when to ask follow-ups.
- `InterviewerAgent`: generates interview questions, follow-ups, and closing remarks.
- `FeedbackEvaluator`: generates the final structured feedback report.

### Meeting Agents

Meeting Mode uses:

- `MeetingOrchestrator`: controls participant order and prevents uncontrolled multi-agent chatter.
- `ModeratorAgent`: opens, redirects, and summarizes the meeting.
- `ParticipantAgent`: represents one participant perspective.
- `FeedbackEvaluator`: generates the final meeting summary and user communication feedback.

### Agent Constraints

Agents should use structured outputs where possible. The application should validate model responses before rendering or storing them.

Agents should not be allowed to create unlimited turns. Each session has a clear turn budget so the product remains predictable and affordable.

## Audio Architecture

The audio system has three responsibilities:

- Capture user microphone input.
- Convert spoken user input into usable transcript and semantic understanding.
- Generate natural spoken responses from AI text output.

The implementation should keep providers behind interfaces:

```ts
interface AudioInputProvider {
  capture(): Promise<AudioInput>;
}

interface SpeechUnderstandingProvider {
  understand(input: AudioInput, context: SessionContext): Promise<SpeechUnderstanding>;
}

interface SpeechOutputProvider {
  speak(text: string, voice: VoiceProfile): Promise<AudioOutput>;
}
```

Gemma/Gemma 4 should be used where it provides the strongest value for audio understanding, conversation reasoning, agent output, and structured feedback. The product architecture should not assume that one model endpoint handles every task equally well.

## Core Data Model

```ts
type PracticeMode = "interview" | "meeting";

type SessionStatus = "setup" | "active" | "completed" | "failed";

interface PracticeSession {
  id: string;
  mode: PracticeMode;
  status: SessionStatus;
  createdAt: string;
  setup: InterviewSetup | MeetingSetup;
  turns: ConversationTurn[];
  report?: FeedbackReport;
}

interface ConversationTurn {
  id: string;
  speakerId: string;
  speakerRole: "user" | "interviewer" | "moderator" | "participant";
  text: string;
  audioUrl?: string;
  startedAt: string;
  endedAt?: string;
}

interface FeedbackReport {
  summary: string;
  scores: {
    clarity: number;
    relevance: number;
    listening: number;
    fluency: number;
    confidence: number;
  };
  strengths: string[];
  improvements: string[];
  betterAnswerExamples: string[];
  nextPractice: string[];
}
```

## UX Principles

The app should feel like a practice room, not a content library.

Important UX requirements:

- The first screen should let users start a session quickly.
- Interview Mode should be visually dominant because it is the primary v0 flow.
- Meeting Mode should be available but not visually equal to the main path.
- Voice state must be obvious: listening, processing, speaking, idle, failed.
- Transcript text should be readable but secondary to the spoken interaction.
- Feedback should be scannable and action-oriented.
- Local history should be simple: recent sessions, report preview, clear history.

## v0 Non-Goals

v0 does not include:

- User accounts.
- Cloud-synced history.
- Payment or subscription.
- Admin dashboard.
- Full live web search as a required dependency.
- Deep role-specific interview expertise.
- Sentence-by-sentence grammar correction.
- Pronunciation phoneme analysis.
- Unmoderated multi-agent free conversation.
- Real-time overlapping speech.
- Complex calendar, file, or meeting integrations.

## OpenSpec Decomposition

The product should be decomposed into separate OpenSpec changes rather than one large change.

Recommended first changes:

1. `add-app-foundation`
   - Web app scaffold.
   - Shared UI shell.
   - Session state model.
   - Provider interfaces.
   - CI and deployment baseline.

2. `add-interview-room-mvp`
   - Interview setup.
   - One AI interviewer.
   - Voice input and output.
   - Interview turn loop.
   - Structured feedback report.

3. `add-local-session-history`
   - Save completed sessions locally.
   - Show recent sessions.
   - Clear local history.

4. `add-meeting-room-mvp`
   - Business meeting setup.
   - Moderator and 2-3 participants.
   - Controlled turn-taking.
   - Meeting summary and feedback.

5. `add-context-provider-abstraction`
   - Built-in question bank provider.
   - Interface for future search-enhanced context.

The first implementation plan should focus on `add-app-foundation` because the repository is currently empty except for initial project notes and license files. The first product feature plan should then focus on `add-interview-room-mvp`.

## Success Criteria

The v0 is successful if:

- A user can complete an interview practice session using voice input and voice output.
- The AI asks relevant questions and follow-ups.
- The system generates useful structured feedback.
- A user can run a lightweight business meeting practice session.
- Recent session reports can be reviewed locally.
- The deployed website works without a scripted demo path.
- The architecture leaves clear extension points for search-enhanced context and richer role-specific practice.

## Risks and Mitigations

### Audio Quality Risk

Risk: poor speech output or recognition quality weakens the core product.

Mitigation: use provider interfaces, test realistic microphone input early, and keep transcript fallback visible for recovery.

### Scope Risk

Risk: doing Interview and Meeting in v0 may dilute execution.

Mitigation: make Interview the primary demo path and keep Meeting moderated, turn-limited, and business-topic focused.

### Model Reliability Risk

Risk: model responses may be too verbose, too generic, or structurally invalid.

Mitigation: use strict prompts, structured output validation, turn budgets, and built-in question bank defaults.

### Search Dependency Risk

Risk: live search can introduce latency, cost, or unreliable content.

Mitigation: do not require search for v0. Keep search-enhanced context behind `ContextProvider`.

## v0 Default Decisions

- Deployment target: Vercel first. Cloudflare can be evaluated later if Vercel creates runtime or pricing constraints.
- Interview demo length: 5 to 8 turns, with a target maximum of 8 minutes per session.
- Meeting demo length: 6 to 10 total turns, with a target maximum of 10 minutes per session.
- Speech input: browser microphone capture with server-side model processing behind `SpeechUnderstandingProvider`.
- Speech output: high-quality generated speech behind `SpeechOutputProvider`. Prefer a Google speech stack for hackathon coherence when quality and latency are acceptable. Browser TTS is only a development and emergency fallback.
- Model usage: use Gemma/Gemma 4 where it is strongest for audio understanding, conversation reasoning, agent behavior, and structured feedback. Keep providers replaceable so implementation can use the best available endpoint for each task.
- Context source: built-in question and prompt bank is required for v0. Search-enhanced context is optional and must not block the default flow.
