# GemCouncil

GemCouncil is a Gemma-powered communication equity coach for non-native English speakers preparing for high-pressure interviews and business meetings.

The project uses open, remote-deployable model services to help people practice the room before they enter the room: users speak naturally, an AI interviewer listens and follows up, and the system produces transparent feedback grounded in the user's own answers.

The v0 product direction is documented in `docs/superpowers/specs/2026-05-01-gemcouncil-v0-product-design.md`.

## Hackathon Positioning

GemCouncil targets **Digital Equity & Inclusivity** and **Future of Education**. Many capable people lose opportunities because live English interviews and meetings reward speed, confidence, accent familiarity, and implicit cultural patterns. GemCouncil gives them a private, affordable practice environment that simulates realistic spoken pressure and explains how to improve.

The demo story:

1. A non-native English speaker is preparing for an English interview or global team meeting.
2. They practice with a proactive AI interviewer that asks one question at a time and follows up when answers are vague.
3. Gemma speech understanding turns spoken answers into structured conversation context.
4. The system generates spoken interviewer responses through a remote TTS provider.
5. The final report gives scores, evidence, and better answer examples instead of generic encouragement.

Gemma 4 alignment:

- **Multimodal understanding:** user answers are captured as speech and routed through a Gemma speech understanding provider.
- **Agentic orchestration:** interviewer behavior is controlled by explicit actions such as opening question, follow-up, next question, redirect, and close.
- **Grounded outputs:** future scenario packs and retrieval context will ground interview plans in real communication scenarios.
- **Safety & Trust:** feedback should cite user-answer evidence and expose why each score was assigned.
- **Deployable impact:** Vercel hosts the app, while Gemma and VoxCPM run as remote GPU services that can be deployed by schools, career centers, or community organizations.

The hackathon strategy and demo narrative are documented in `docs/hackathon/gemma4-impact-strategy.md`.

## Current Status

This repository is in the Interview Room MVP phase. The current OpenSpec change is `add-interview-room-mvp`, which adds the first mock end-to-end interview loop on top of the app foundation.

Current Interview Mode status:

- Setup form, interview transcript, mock answer submission, interviewer follow-up generation, and structured feedback are implemented.
- Interview setup includes scenario packs for general English, software engineering, product management, research discussion, scholarship interview, and international team meeting practice.
- Audio chunk planning and transcript stitching utilities are implemented so Gemma audio requests can stay below the 30-second per-request limit.
- Real microphone recording is implemented and currently feeds mock speech understanding.
- Interviewer speech playback state and replay controls are implemented with a mock speech adapter.
- Gemma speech understanding can be enabled through the `services/gemma-speech` FastAPI service and `NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER=gemma`.
- VoxCPM TTS can be enabled through the `services/voxcpm-tts` FastAPI service and `NEXT_PUBLIC_SPEECH_OUTPUT_PROVIDER=voxcpm`.
- Meeting Mode remains deferred until Interview Room is usable with real voice providers.

Near-term product priorities:

1. Upgrade interviewer policy into function-call-style agent actions.
2. Make feedback evidence-based by citing user answer snippets for each score.
3. Add a concise demo script and submission writeup around communication equity.

## Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run the Gemma speech service in mock mode:

```bash
cd services/gemma-speech
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

Enable the Gemma speech provider in the Next.js app:

```bash
NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER=gemma
GEMMA_SPEECH_API_URL=http://127.0.0.1:8000
GEMMA_SPEECH_API_KEY=replace-with-a-shared-secret
```

Run the VoxCPM TTS service in mock mode:

```bash
cd services/voxcpm-tts
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8010
```

Enable the VoxCPM speech output provider in the Next.js app:

```bash
NEXT_PUBLIC_SPEECH_OUTPUT_PROVIDER=voxcpm
VOXCPM_TTS_API_URL=http://127.0.0.1:8010
VOXCPM_TTS_API_KEY=replace-with-a-shared-secret
```

Remote GPU provider deployment is documented in `docs/deployment/remote-providers.md`.

Run verification:

```bash
npm run verify
```

## Scripts

- `npm run dev` starts the local Next.js server.
- `npm run build` creates a production build.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run lint` runs ESLint.
- `npm run test` runs unit tests.
- `npm run verify` runs typecheck, lint, tests, and build.

## Project Structure

- `src/app/` contains the Next.js app shell.
- `src/domain/session.ts` defines practice session, turn, setup, and feedback contracts.
- `src/domain/providers.ts` defines provider interfaces for speech, model reasoning, and context sourcing.
- `openspec/` contains OpenSpec changes and capability specs.
- `docs/superpowers/` contains product design and implementation plans.

## Deployment

The first deployment target is Vercel. The app foundation must pass `npm run build` before deployment.
