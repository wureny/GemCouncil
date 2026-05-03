## ADDED Requirements

### Requirement: Structured feedback report

The system SHALL generate a structured feedback report for a completed interview session.

#### Scenario: Feedback generated

- **WHEN** an interview session has at least one interviewer turn and one user answer turn
- **THEN** the system can generate a feedback report
- **AND** the report includes summary, scores, strengths, improvements, better answer examples, and next practice recommendations

#### Scenario: Feedback score dimensions

- **WHEN** the system generates feedback scores
- **THEN** the scores include clarity, relevance, listening, fluency, and confidence
- **AND** each score is numeric
- **AND** each score is bounded by the configured scoring range

#### Scenario: Feedback score evidence

- **WHEN** evidence-based feedback is enabled
- **THEN** each score includes a short transcript evidence snippet or paraphrase
- **AND** each score includes a rationale explaining how that evidence affected the score
- **AND** the report keeps the evidence concise enough to avoid reproducing the full transcript

### Requirement: Feedback uses transcript context

The system SHALL evaluate the interview using the consolidated conversation transcript and interview setup context.

#### Scenario: Setup context available

- **WHEN** the user provided interview setup context
- **THEN** the feedback evaluates whether the user's answers were relevant to that context

#### Scenario: Transcript is insufficient

- **WHEN** the session has no user answer turns
- **THEN** the system does not generate a normal feedback report
- **AND** explains that at least one answer is required

### Requirement: Actionable next practice

The system SHALL provide feedback that helps the user practice the next session.

#### Scenario: Better answer examples generated

- **WHEN** the system identifies an improvement area
- **THEN** it provides at least one better answer example or answer framing suggestion

#### Scenario: Next practice generated

- **WHEN** feedback generation succeeds
- **THEN** the report includes concrete next practice recommendations
- **AND** the recommendations are based on the session transcript rather than generic English-learning advice
