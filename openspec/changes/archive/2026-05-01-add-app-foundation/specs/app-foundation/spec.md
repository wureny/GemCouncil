## ADDED Requirements

### Requirement: Deployable web application foundation

The system SHALL provide a web application scaffold that can run locally and can be deployed as the GemCouncil prototype.

#### Scenario: Local development server starts

- **WHEN** a developer installs dependencies and runs the documented development command
- **THEN** the web application starts successfully on a local URL
- **AND** the first screen identifies the product as GemCouncil
- **AND** the first screen exposes entry points for Interview Mode and Meeting Mode without requiring those flows to be implemented by this change

#### Scenario: Production build succeeds

- **WHEN** a developer runs the documented production build command
- **THEN** the build completes without TypeScript, lint, or framework build errors
- **AND** the generated output is compatible with the selected Vercel-first deployment target

### Requirement: Shared session contracts

The system SHALL define shared TypeScript contracts for practice sessions, conversation turns, and feedback reports.

#### Scenario: Session contracts are importable

- **WHEN** application code imports the shared session contracts
- **THEN** it can reference `PracticeSession`, `ConversationTurn`, and `FeedbackReport`
- **AND** the contracts distinguish Interview and Meeting practice modes
- **AND** the contracts represent setup, active, completed, and failed session states

#### Scenario: Feedback report contract supports v0 scoring

- **WHEN** application code creates a feedback report
- **THEN** the report supports summary text
- **AND** the report supports numeric scores for clarity, relevance, listening, fluency, and confidence
- **AND** the report supports strengths, improvements, better answer examples, and next practice recommendations

### Requirement: Provider interface boundaries

The system SHALL define provider interfaces that isolate external model, audio, and context services from application flow code.

#### Scenario: Speech understanding provider boundary exists

- **WHEN** application code needs to interpret user speech
- **THEN** it depends on a `SpeechUnderstandingProvider` interface rather than a concrete vendor implementation
- **AND** the interface accepts captured audio and session context
- **AND** the interface returns transcript and semantic understanding data

#### Scenario: Speech output provider boundary exists

- **WHEN** application code needs AI speech output
- **THEN** it depends on a `SpeechOutputProvider` interface rather than a concrete vendor implementation
- **AND** the interface accepts response text and a voice profile
- **AND** the interface returns playable audio output metadata

#### Scenario: Context provider boundary exists

- **WHEN** application code needs interview or meeting setup context
- **THEN** it depends on a `ContextProvider` interface
- **AND** the interface can be implemented by a built-in prompt bank
- **AND** the interface can later be implemented by search-enhanced context without changing session orchestration code

### Requirement: Verification workflow

The system SHALL provide repeatable commands for typechecking, linting, unit testing, and production build verification.

#### Scenario: Local verification command runs

- **WHEN** a developer runs the documented local verification command
- **THEN** typechecking, linting, and tests run in a predictable order
- **AND** failures return a non-zero exit code

#### Scenario: CI verifies pull requests

- **WHEN** code is pushed to GitHub or opened as a pull request
- **THEN** CI runs dependency installation, typechecking, linting, tests, and production build verification
- **AND** CI fails if any verification step fails

### Requirement: Foundation documentation

The system SHALL document how to run, verify, and deploy the app foundation.

#### Scenario: Developer follows README setup

- **WHEN** a new developer reads the repository README
- **THEN** they can identify the project goal
- **AND** they can install dependencies
- **AND** they can start the development server
- **AND** they can run verification
- **AND** they can understand that Interview and Meeting behavior will be added by later OpenSpec changes
