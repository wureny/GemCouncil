## ADDED Requirements

### Requirement: Interview setup

The system SHALL allow a user to configure a general English interview practice session before starting the interview.

#### Scenario: Start with default setup

- **WHEN** the user opens Interview Mode and starts without entering optional details
- **THEN** the system creates an interview session with style `random`
- **AND** difficulty `auto`
- **AND** a general English interview goal

#### Scenario: Start with user context

- **WHEN** the user enters interview goal, target context, self-introduction, background notes, style, and difficulty
- **THEN** the system creates an interview session containing that setup context
- **AND** the interviewer uses the setup context when choosing questions and follow-ups

### Requirement: One-on-one interview room

The system SHALL provide an active interview room with one AI interviewer and one user.

#### Scenario: Interviewer asks first question

- **WHEN** an interview session starts
- **THEN** the AI interviewer produces the first interview question
- **AND** the question is shown in the transcript
- **AND** the question is available for speech output playback

#### Scenario: User answer advances the session

- **WHEN** the user submits a spoken answer
- **THEN** the answer transcript is appended as a user conversation turn
- **AND** the interviewer produces either a follow-up question or the next interview question
- **AND** the session remains active until the turn budget is reached or the user ends the session

### Requirement: Interview turn budget

The system SHALL constrain interview sessions with a predictable turn budget.

#### Scenario: Turn budget reached

- **WHEN** the configured interview turn budget is reached
- **THEN** the system stops asking new interview questions
- **AND** prompts the user to generate the final feedback report

#### Scenario: User ends session early

- **WHEN** the user chooses to end an active interview before the turn budget is reached
- **THEN** the system marks the interview as ready for feedback
- **AND** does not request another interviewer question

### Requirement: Mock provider fallback

The system SHALL support a deterministic mock provider path for development and tests.

#### Scenario: Mock providers enabled

- **WHEN** the app is configured to use mock providers
- **THEN** the interview session can start, accept user answer text, produce interviewer responses, and produce feedback without external model or speech services

#### Scenario: External provider unavailable

- **WHEN** an external provider request fails during development
- **THEN** the system surfaces a recoverable error state
- **AND** does not corrupt the active session transcript
