# GemCouncil

GemCouncil is a voice-first practice room for non-native English speakers preparing for high-pressure interviews and business meetings.

The v0 product direction is documented in `docs/superpowers/specs/2026-05-01-gemcouncil-v0-product-design.md`.

## Current Status

This repository is in the Interview Room MVP phase. The current OpenSpec change is `add-interview-room-mvp`, which adds the first mock end-to-end interview loop on top of the app foundation.

Current Interview Mode status:

- Setup form, interview transcript, mock answer submission, interviewer follow-up generation, and structured feedback are implemented.
- Audio chunk planning and transcript stitching utilities are implemented so Gemma audio requests can stay below the 30-second per-request limit.
- Real microphone recording is implemented and currently feeds mock speech understanding.
- Interviewer speech playback state and replay controls are implemented with a mock speech adapter.
- Gemma speech understanding can be enabled through the `services/gemma-speech` FastAPI service and `NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER=gemma`.
- VoxCPM TTS can be enabled through the `services/voxcpm-tts` FastAPI service and `NEXT_PUBLIC_SPEECH_OUTPUT_PROVIDER=voxcpm`.
- Meeting Mode remains deferred until Interview Room is usable with real voice providers.

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
