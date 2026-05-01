## Why

GemCouncil currently has product direction but no application foundation. Before building interview or meeting behavior, the project needs a deployable web app baseline, shared contracts, provider boundaries, and verification workflow so later agentic development has stable rails.

## What Changes

- Add the initial web application foundation for a deployed GemCouncil prototype.
- Add shared session and feedback contracts that later Interview and Meeting changes can build on.
- Add provider interfaces for speech understanding, speech output, model reasoning, and context sourcing.
- Add local development, formatting, typechecking, testing, and CI conventions.
- Add a deployment-ready project structure suitable for Vercel-first delivery.
- No user-facing Interview or Meeting session behavior is implemented in this change.

## Capabilities

### New Capabilities

- `app-foundation`: Establishes the project scaffold, shared contracts, provider interfaces, local development workflow, CI baseline, and deployment readiness for future GemCouncil features.

### Modified Capabilities

None.

## Impact

- Affected code: repository root, web app scaffold, shared packages, tests, CI configuration, and documentation.
- Affected APIs: initial TypeScript interfaces for sessions, turns, reports, audio/model providers, and context providers.
- Affected dependencies: frontend framework, TypeScript tooling, test tooling, lint/format tooling, and deployment-compatible runtime choices.
- Affected systems: local development environment, GitHub CI, and Vercel deployment path.
