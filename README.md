# GemCouncil

GemCouncil is a voice-first practice room for non-native English speakers preparing for high-pressure interviews and business meetings.

The v0 product direction is documented in `docs/superpowers/specs/2026-05-01-gemcouncil-v0-product-design.md`.

## Current Status

This repository is in the app foundation phase. The current OpenSpec change is `add-app-foundation`, which establishes the web app scaffold, shared contracts, provider interfaces, verification workflow, and deployment baseline.

Interview and Meeting session behavior are intentionally deferred to later OpenSpec changes.

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
