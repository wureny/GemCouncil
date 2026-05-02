# GemCouncil

GemCouncil is a voice-first practice room for non-native English speakers preparing for high-pressure interviews and business meetings.

The v0 product direction is documented in `docs/superpowers/specs/2026-05-01-gemcouncil-v0-product-design.md`.

## Current Status

This repository is in the Interview Room MVP phase. The current OpenSpec change is `add-interview-room-mvp`, which adds the first mock end-to-end interview loop on top of the app foundation.

Current Interview Mode status:

- Setup form, interview transcript, mock answer submission, interviewer follow-up generation, and structured feedback are implemented.
- Audio chunk planning and transcript stitching utilities are implemented so Gemma audio requests can stay below the 30-second per-request limit.
- Real microphone recording is implemented and currently feeds mock speech understanding.
- Gemma speech understanding and high-quality TTS provider integration are next.
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
