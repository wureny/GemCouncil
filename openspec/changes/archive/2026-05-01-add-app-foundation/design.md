## Context

The repository currently contains the GemCouncil v0 product design and license but no application code. GemCouncil needs a real deployed prototype with voice-first Interview and Meeting modes. Before those product flows are implemented, the project needs a narrow foundation that future changes can rely on.

This foundation should optimize for a fast hackathon prototype while keeping enough engineering structure for agentic development: clear contracts, provider boundaries, repeatable verification, and small modules that later agents can extend without rewriting the project.

## Goals / Non-Goals

**Goals:**

- Create a Vercel-first web app foundation.
- Establish TypeScript contracts for sessions, turns, reports, setup data, provider inputs, and provider outputs.
- Define provider interfaces for speech understanding, speech output, model reasoning, and context sourcing.
- Add local development, typecheck, lint, test, build, and CI workflows.
- Add documentation that lets another agent or developer start work without guessing the setup.

**Non-Goals:**

- Implement a working Interview session.
- Implement a working Meeting session.
- Integrate a real speech or model provider.
- Add authentication, database persistence, or cloud history.
- Add live search or retrieval.
- Polish the final v0 UI.

## Decisions

### Decision: Use a Vercel-first TypeScript web app

Use a TypeScript web application structure compatible with Vercel as the first deployment target.

Rationale: the product needs a deployed web prototype quickly, and Vercel keeps frontend deployment, server routes, previews, and environment variables straightforward for a hackathon timeline.

Alternative considered: Cloudflare-first deployment. Cloudflare remains a possible later option, but it can constrain runtime APIs and provider SDK choices earlier than necessary.

### Decision: Keep app behavior thin in the foundation

The foundation screen should show GemCouncil identity and entry points for Interview and Meeting, but it should not implement the full practice flows.

Rationale: this change creates stable rails. Product behavior belongs in subsequent OpenSpec changes so each capability remains reviewable and testable.

Alternative considered: implement Interview directly inside the foundation change. That would speed visible progress but would mix scaffold decisions with product behavior and make review harder.

### Decision: Define provider interfaces before provider implementations

Add provider interfaces for speech understanding, speech output, model reasoning, and context sourcing before choosing concrete services.

Rationale: GemCouncil will likely use different services for audio understanding, generated speech, reasoning, and fallback behavior. Interfaces let future changes plug in real providers without coupling the UI and orchestration code to one vendor.

Alternative considered: call concrete APIs directly from app routes. That is faster initially but makes fallback, testing, and later provider replacement harder.

### Decision: Use local-first contracts and tests

Define contracts in shared TypeScript modules and test them with lightweight unit tests.

Rationale: future agentic tasks need stable data shapes. Shared contracts reduce ambiguity across UI, orchestration, storage, and provider code.

Alternative considered: infer shapes from React component state. That would be quick but fragile once Interview, Meeting, local history, and feedback reports are built by separate changes.

### Decision: CI must verify the foundation from day one

Add CI that runs install, typecheck, lint, tests, and build.

Rationale: the project goal includes agentic development at a high standard. CI provides the minimum feedback loop for multiple agents and future pull requests.

Alternative considered: rely on manual local verification until the first product flow exists. That saves a small amount of setup time but weakens every later change.

## Risks / Trade-offs

- [Risk] Foundation work can feel slower than building the demo UI immediately. → Mitigation: keep this change limited to scaffold, contracts, provider interfaces, and verification only.
- [Risk] Provider interfaces may be over-designed before real provider constraints are known. → Mitigation: keep interfaces minimal and revise them only through later OpenSpec changes when concrete integrations require it.
- [Risk] Vercel-first choices may need adjustment if a chosen audio/model provider requires a different runtime. → Mitigation: keep provider calls isolated behind server routes and provider modules.
- [Risk] CI can slow iteration if tooling is too strict too early. → Mitigation: use standard TypeScript, lint, test, and build checks only; avoid custom quality gates in this change.

## Migration Plan

1. Add the web app scaffold and shared module structure.
2. Add contracts and provider interfaces.
3. Add minimal app screen and tests.
4. Add verification scripts and CI.
5. Document local development and deployment baseline.

Rollback: revert this change before product feature changes depend on it. No user data or deployed production state is affected.
